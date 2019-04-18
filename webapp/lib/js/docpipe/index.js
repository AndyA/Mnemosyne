"use strict";

const stream = require("stream");
const _ = require("lodash");
const assert = require("assert");

const DocPipeStream = require("./stream");

class Context {
  constructor(doc, dp) {
    this.doc = doc;
    this.dp = dp;
    this.dirty = false;
    this.skipped = false;
    this.failed = false;
    this.dp._logStats("created");
  }

  hardFail() {
    this.dp.fail();
    this.failed = true;
    this.dp._logStats("hardFail");
  }

  softFail() {
    this.failed = true;
    this.dp._logStats("softFail");
  }

  save(doc) {
    if (!this.dirty) {
      this.dirty = true;
      this.dp._logStats("save");
    }
    this.dp._logStats("saveAll");
    if (this.failed)
      return this.doc;
    return doc || this.doc;
  }

  skip() {
    this.dp._logStats("skip");
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

    this.stats = {};
    this.failed = false;
  }

  _logStats(kind, count = 1) {
    this.stats[kind] = (this.stats[kind] || 0) + count;
    return this;
  }

  fail() {
    this._stages = [];
    this.failed = true;
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
    assert(!this.failed, "Can't add stage to failed DocPipe");

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
      if (this.failed) break;
      const nextDoc = await stage.process(doc, ctx);
      if (ctx.skipped) return;
      doc = nextDoc || doc;
    }
    return doc;
  }

  async processDoc(doc) {
    let ctx = new Context(doc, this);
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
