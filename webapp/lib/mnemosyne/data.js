"use strict";

const MnemosyneHash = require("./hash.js");

class MnemosyneData {
  constructor(data) {
    this.data = data;
  }

  get uuid() {
    return this.data.uuid || "UNKNOWN";
  }

  get index() {
    return this.data.index = this.data.index || {};
  }

  atPath(path) {
    const keys = path.split(".");
    let obj = this.data;
    for (const key of keys) {
      if (obj === undefined) return;
      obj = obj[key];
    }
    return obj;
  }

  getSetData(set) {
    return set.split(":").map(path => this.atPath(path));
  }

  getSetUUID(set) {
    const data = this.getSetData(set);
    if (!data.every(x => x !== undefined && x !== null)) return;
    return MnemosyneHash.createUUID(data);
  }

  buildIndex(sets) {
    let index = {};
    for (const set of sets) {
      const uuid = this.getSetUUID(set);
      if (uuid !== undefined)
        index[set] = uuid;
    }
    return index;
  }

  checkIndex(index) {
    const sets = Object.keys(index).sort();
    let fail = [];
    for (const set of sets) {
      const suspect = index[set];
      const uuid = this.getSetUUID(set);
      if (suspect !== uuid)
        fail.push({
          set,
          suspect,
          uuid
        });
    }
    return fail;
  }

  validate() {
    const fail = this.checkIndex(this.index);
    if (fail.length)
      throw new Error("Index validation failed for " +
        fail.map(f => f.set).join(", ") + " on " + this.uuid);
    return this;
  }

  addIndex(set) {
    let index = this.index;
    const uuid = this.getSetUUID(set);
    if (uuid === undefined) return this;

    if (index[set] !== undefined) {
      if (index[set] !== uuid)
        throw new Error("Index UUID incorrect for " + set + " on " + this.uuid);
      return this;
    }

    index[set] = uuid;

    return this;
  }
}

module.exports = MnemosyneData;

