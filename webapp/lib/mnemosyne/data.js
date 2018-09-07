"use strict";

const MnemosyneHash = require("./hash.js");

class MnemosyneData {
  constructor(data) {
    this.data = data;
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
    return MnemosyneHash.createUUID(this.getSetData(set));
  }

  buildIndex(sets) {
    let index = {};
    for (const set of sets) {
      const uuid = this.getSetUUID(set);
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
    const fail = this.checkIndex(this.index, this.invertedIndex);
    if (fail.length)
      throw new Error("Index validation failed for " +
        fail.map(f => f.set).join(", "));
    return this;
  }

  addIndex(set) {
    let index = this.index;
    const uuid = this.getSetUUID(set);

    if (index[set] !== undefined) {
      if (index[set] !== uuid)
        throw new Error("Index uuid incorrect for " + set);
      return this;
    }

    index[set] = uuid;

    return this;
  }
}

module.exports = MnemosyneData;

