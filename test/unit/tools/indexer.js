"use strict";
"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const Indexer = require("lib/js/tools/indexer");

describe("Indexer", () => {

  describe("uniqueByKey", () => {
    it("should make a simple unique index", () => {
      const idx = Indexer.uniqueByKey(
        [
          {
            ID: "one"
          }, {
            ID: "two"
          }
        ], "ID"
      );

      expect(idx).to.deep.equal({
        one: {
          ID: "one"
        },
        two: {
          ID: "two"
        }
      });
    });

    it("should make a compound unique index", () => {
      const idx = Indexer.uniqueByKey(
        [
          {
            ID: "one",
            type: "animal"
          }, {
            ID: "two",
            type: "animal"
          }, {
            ID: "one",
            type: "vegetable"
          }
        ], "type", "ID"
      );

      expect(idx).to.deep.equal({
        animal: {
          one: {
            ID: "one",
            type: "animal"
          },
          two: {
            ID: "two",
            type: "animal"
          }
        },
        vegetable: {
          one: {
            ID: "one",
            type: "vegetable"
          },
        }
      });
    });

    it("should throw on missing keys", () => {
      expect(() => {
        Indexer.uniqueByKey([{
          ID: "one"
        }], "type")
      }).to.throw(/Missing/);

      expect(() => {
        Indexer.uniqueByKey([{
          ID: "one"
        }], "type", "ID")
      }).to.throw(/Missing/);
    });

    it("should throw on duplicate keys", () => {
      expect(() => {
        Indexer.uniqueByKey([{
          ID: 1
        }, {
          ID: 1
        }], "ID");
      }).to.throw(/Duplicate/);
    });

  });

  describe("allByKey", () => {
    it("should make a simple non-unique index", () => {
      const idx = Indexer.allByKey(
        [
          {
            ID: "one",
            name: "A"
          }, {
            ID: "two",
            name: "B"
          }, {
            ID: "two",
            name: "C"
          }
        ], "ID"
      );

      expect(idx).to.deep.equal({
        one: [{
          ID: "one",
          name: "A"
        }],
        two: [{
          ID: "two",
          name: "B"
        }, {
          ID: "two",
          name: "C"
        }]
      });
    });

    it("should handle JSONPath", () => {
      const idx = Indexer.allByKey([
        {
          x: {
            ID: "one"
          }
        },
        {
          x: {
            ID: "two"
          }
        },
        {
          x: {
            ID: "three"
          }
        },
      ], "$.x.ID");
      expect(idx).to.deep.equal({
        one: [{
          x: {
            ID: "one"
          }
        }],
        two: [{
          x: {
            ID: "two"
          }
        }],
        three: [{
          x: {
            ID: "three"
          }
        }],
      });
    });
  });

});
