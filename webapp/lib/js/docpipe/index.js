"use strict";

const stream = require("stream");
const _ = require("lodash");

const DocPipeStream = require("./stream");

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

class DocPipe {
  constructor(options) {
    this.opt = Object.assign({
      allDirty: false
    }, options || {});

    this.seq = 0;
    this._stages = [];

    if (this.opt.allDirty)
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

  // We have the same signature as a stage - composition ahoy!
  async process(doc, ctx) {
    for (const stage of this.stages) {
      const nextDoc = await stage.process(doc, ctx);
      if (ctx.skipped) return;
      doc = nextDoc || doc;
    }
    return doc;
  }

  async processDoc(doc) {
    let ctx = new Context(doc);
    doc = await this.process(doc, ctx);
    if (ctx.dirty && !ctx.skipped) return doc;
  }

  async processAll(docs) {
    return Promise.all(docs.map(d => this.processDoc(d)))
      .then(docs => docs.filter(d => d !== undefined));;
  }

  getStream(opt) {
    return new DocPipeStream(this, opt);
  }
}

module.exports = {
  DocPipe,
  DocPipeStream
};
