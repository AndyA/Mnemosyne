"use strict";

const chai = require("chai");
const expect = chai.expect;
const stream = require("stream");
const Promise = require("bluebird");

require("../../../webapp/use.js");

const {DocPipe} = require("lib/js/docpipe");

class Broadcasts {
  process(doc, ctx) {
    if (doc.kind === "broadcast")
      return ctx.save(doc);
  }
}

class Episodes {
  process(doc, ctx) {
    if (doc.kind === "episode")
      ctx.save();
  }
}

const docs = [
  {
    _id: 1,
    kind: "broadcast",
    episode: 2,
    service: 4
  }, {
    _id: 2,
    kind: "episode"
  }, {
    _id: 3,
    kind: "broadcast",
    episode: 2,
    service: 4
  }, {
    _id: 4,
    kind: "service"
  }
];

describe("DocPipe", () => {
  describe("processDoc / processAll", () => {

    it("should handle function stages", async () => {
      const dp = new DocPipe();
      dp.addStage((doc, ctx) => {
        if (doc._id >= 3)
          ctx.save();
      });
      const got = await dp.processAll(docs);
      const want = docs.filter(d => d._id >= 3);
      expect(got).to.deep.equal(want);
    });

    it("should drop all unsaved docs", async () => {
      const dp = new DocPipe();
      const got = await dp.processAll(docs);
      expect(got).to.be.empty;
    });

    it("should keep all docs with allDirty = true", async () => {
      const dp = new DocPipe({
        allDirty: true
      });
      const got = await dp.processAll(docs);
      expect(got).to.deep.equal(docs);
    });

    it("should keep all saved docs", async () => {
      const dp = new DocPipe();
      dp.addStage(new Broadcasts());
      dp.addStage(new Episodes());
      const got = await dp.processAll(docs);
      const want = docs.filter(d => d.kind === "broadcast" || d.kind === "episode");
      expect(got).to.deep.equal(want);
    });

    it("should respect priority", async () => {
      const dp = new DocPipe();
      dp
        .addStage((doc, ctx) => {
          doc.log.push(3); ctx.save();
        }, 30)
        .addStage((doc, ctx) => {
          doc.log = [1]; ctx.save();
        }, -10)
        .addStage((doc, ctx) => {
          doc.log.push(2); ctx.save();
        }, 20)
        .addStage((doc, ctx) => {
          doc.log.push(4); ctx.save();
        }, 30)
        .addStage((doc, ctx) => ctx.save(Object.assign({}, doc)), -1000);

      const got = await dp.processAll(docs);
      expect(got).to.not.deep.equal(docs);

      const want = docs.map(d => Object.assign({ }, d, {
        log: [1, 2, 3, 4]
      }));

      expect(got).to.deep.equal(want);
    });

    it("should drop skipped docs", async () => {
      const dp = new DocPipe();
      dp.addStage((doc, ctx) => {
        if (doc._id >= 3)
          ctx.save();
      });
      dp.addStage((doc, ctx) => {
        if (doc._id % 2)
          ctx.skip();
      });

      const got = await dp.processAll(docs);
      const want = docs.filter(d => d._id >= 3 && 0 === d._id % 2);
      expect(got).to.deep.equal(want);
    });

    it("should allow a DocPipe as a stage", async () => {
      const dp = new DocPipe();
      dp.addStage((doc, ctx) => ctx.save(Object.assign({
        log: []
      }, doc)), -1000);
      dp.addStage((doc, ctx) => {
        doc.log.push(4)
      }, 40);
      dp.addStage((doc, ctx) => {
        doc.log.push(1)
      }, 10);

      const dp1 = new DocPipe();
      dp1.addStage((doc, ctx) => {
        doc.log.push(3)
      }, 400);
      dp1.addStage((doc, ctx) => {
        doc.log.push(2)
      }, 100);
      dp.addStage(dp1, 20);

      const got = await dp.processAll(docs);
      expect(got).to.not.deep.equal(docs);

      const want = docs.map(d => Object.assign({ }, d, {
        log: [1, 2, 3, 4]
      }));

      expect(got).to.deep.equal(want);
    });
  });

  describe("Transform stream", () => {

    class TestSource extends stream.Readable {
      constructor(data) {
        super({
          objectMode: true
        });
        this.data = data.slice(0);
      }

      _read(size) {
        if (!this.data.length) {
          this.push(null);
          return;
        }
        while (this.data.length) {
          if (!this.push(this.data.shift()))
            break;
        }
      }
    }

    function drainStream(rs) {
      return new Promise((resolve, reject) => {
        let docs = [];
        rs.on("data", doc => docs.push(doc)).on("end", () => resolve(docs));
      });
    }

    describe("TestSource", () => {
      it("should pass all data", async () => {
        const ts = new TestSource(docs);
        const got = await drainStream(ts);
        expect(got).to.deep.equal(docs);
      });
    });

    describe("DocPipe", () => {

      it("should pass all dirty docs", async () => {
        const ts = new TestSource(docs);
        const dp = new DocPipe({
          allDirty: true
        });
        const got = await drainStream(ts.pipe(dp.getStream()));
        expect(got).to.deep.equal(docs);
      });

      it("should allow promises", async () => {
        const ts = new TestSource(docs);
        const dp = new DocPipe();

        dp.addStage((doc, ctx) => {
          if (doc.kind === "episode")
            return Promise.delay(10).then(() => {
              ctx.save(Object.assign(doc, {
                name: "An episode"
              }))
            });
        });

        dp.addStage((doc, ctx) => {
          if (doc.kind === "service")
            return Promise.delay(5).then(() => {
              ctx.save(Object.assign(doc, {
                name: "A service"
              }))
            });
        });

        const got = await drainStream(ts.pipe(dp.getStream()));
        const want = [
          {
            _id: 2,
            kind: 'episode',
            name: 'An episode'
          },
          {
            _id: 4,
            kind: 'service',
            name: 'A service'
          }
        ];

        expect(got).to.deep.equal(want);

      });

    });

  });
});
