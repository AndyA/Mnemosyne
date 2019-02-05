"use strict";

const _ = require("lodash");

function buildIndex(recs, keys, idx, cb) {
  if (!_.isArray(recs))
    throw new Error("Need an array of records");

  let keyPath = _.flattenDeep(keys);

  if (!keyPath.length)
    throw new Error("No keys provided");

  const keyLeaf = keyPath.pop();

  for (const rec of recs) {
    let slot = idx;
    for (const key of keyPath) {
      const kv = rec[key];
      if (kv === undefined)
        throw new Error("Missing key " + key);
      slot = slot[kv] = slot[kv] || {};
    }
    const kv = rec[keyLeaf];
    if (kv === undefined)
      throw new Error("Missing key " + keyLeaf);
    cb(slot, kv, rec);
  }
}

class Indexer {
  static uniqueByKey(recs, ...keys) {
    let idx = {};
    buildIndex(recs, keys, idx, (slot, kv, rec) => {
      if (slot.hasOwnProperty(kv))
        throw new Error("Duplicate key found");
      slot[kv] = rec;
    });
    return idx;
  }

  static allByKey(recs, ...keys) {
    let idx = {};
    buildIndex(recs, keys, idx, (slot, kv, rec) => {
      if (!slot.hasOwnProperty(kv))
        slot[kv] = [];
      slot[kv].push(rec);
    });
    return idx;
  }
}

module.exports = Indexer;
