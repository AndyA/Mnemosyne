"use strict";

const MnemosyneHash = require("./hash.js");

class MnemosyneData {
  constructor(data) {
    this.data = data;
  }

  get index() {
    return this.data.index = this.data.index || {};
  }

  get invertedIndex() {
    return this.inv = this.inv || this.invertIndex(this.index);
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

  indexUUID(set) {
    return MnemosyneHash.createUUID(
      set.split(":").map(path => this.atPath(path)));
  }

  buildIndex(sets) {
    let index = {};
    for (const set of sets) {
      const uuid = this.indexUUID(set);
      index[uuid] = set;
    }
    return index;
  }

  invertIndex(index) {
    var out = {};
    for (const key of Object.keys(index)) {
      const val = index[key];
      out[val] = key;
    }
    return out;
  }

  checkIndex(index, inv = null) {
    inv = inv || this.invertIndex(index);
    const sets = Object.keys(inv).sort();
    let fail = [];
    for (const set of sets) {
      const suspect = inv[set];
      const uuid = this.indexUUID(set);
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
    let inv = this.invertedIndex;

    const uuid = this.indexUUID(set);

    if (inv[set] !== undefined) {
      if (inv[set] !== uuid)
        throw new Error("Index uuid incorrect for " + set);
      return this;
    }

    inv[set] = uuid;
    index[uuid] = set;

    return this;
  }
}

module.exports = MnemosyneData;

