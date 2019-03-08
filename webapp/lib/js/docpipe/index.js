"use strict";

const stream = require("stream");
const _ = require("lodash");

class Context {
  constructor(doc) {
    this.doc = doc;
    this.dirty = false;
    this.skipped = false;
  }

  save(doc) {
    this.dirty = true;
    return doc || this.doc;
  }

  skip() {
    this.skipped = true;
  }
}

class DocPipe extends stream.Transform {
  constructor(options) {

    const opt = Object.assign({}, {
      highWaterMark: 256,
      allDirty: false
    }, options || {}, {
      objectMode: true
    })

    super(opt);
    this.opt = opt;
    this.seq = 0;
    this._stages = [];

    if (opt.allDirty)
      this.allDirty();
  }

  _checkStage(stage) {
    if (_.isFunction(stage)) return {
        process: stage
      };
    if (!stage.process)
      throw new Error("Stage needs a process method");
    return stage;
  }

  allDirty() {
    this.addStage((doc, ctx) => ctx.save());
  }

  addStage(stage, priority = 0) {

    this._stages.push({
      stage: this._checkStage(stage),
      priority,
      seq: this.seq++
    });

    delete this._ordered;

    return this;
  }

  get stages() {
    return this._ordered = this._ordered || this._stages
      .slice(0)
      .sort((a, b) => a.priority - b.priority || a.seq - b.seq)
      .map(s => s.stage);
  }

  async process(doc) {
    let ctx = new Context(doc);
    for (const stage of this.stages) {
      const nextDoc = await stage.process(doc, ctx);
      if (ctx.skipped) return;
      doc = nextDoc || doc;
    }
    if (ctx.dirty)
      return doc;
  }

  async processAll(docs) {
    return Promise.all(docs.map(d => this.process(d)))
      .then(docs => docs.filter(d => d !== undefined));;
  }

  _transform(chunk, encoding, callback) {
    this.process(chunk).then(doc => {
      if (doc !== undefined)
        this.push(doc);
      callback();
    });
  }

}

module.exports = DocPipe;
