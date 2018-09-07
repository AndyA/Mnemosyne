"use strict";

const MnemosyneData = require("./data.js");
const MnemosyneTiming = require("./timing.js");

const SECTIONS = [
  "event", "identity", "meta", "raw", "target", "timing"
];

class MnemosyneMessage extends MnemosyneData {
  constructor(msg) {
    super(msg);
  }

  get uuid() {
    return this.data.uuid;
  }

  get timing() {
    return this._timing = this._timing || new MnemosyneTiming(this.data.timing);
  }

  getStash() {
    return this._stash = this._stash || (() => {
      let stash = {
        uuid: this.uuid
      };
      for (const s of SECTIONS) {
        stash[s] = this.data[s] ? JSON.stringify(this.data[s]) : null;
      }
      return Object.assign(stash, {
        start: this.timing.start,
        end: this.timing.end,
        busyStart: this.timing.busyStart,
        busyEnd: this.timing.busyEnd,
        host: this.data.meta.host,
        kind: this.data.meta.kind,
        sender: this.data.meta.sender
      });
    })()
  }

  getIndexStash() {
    return Object.keys(this.index).map(set => {
      return {
        uuid: this.uuid,
        hash: this.index[set],
        set
      }
    });
  }

  static fromLog(log) {
    return log.map(msg => new MnemosyneMessage(msg));
  }
}

module.exports = MnemosyneMessage;
