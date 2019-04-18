"use strict";

const _ = require("lodash");
const jp = require("jsonpath");

function buildIndex(recs, keys, idx, cb) {
  if (!_.isArray(recs))
    throw new Error("Need an array of records");

  let keyPath = _.flattenDeep(keys);

  if (!keyPath.length)
    throw new Error("No keys provided");

  const keyLeaf = keyPath.pop();

  function getKey(rec, key) {
    const val = key[0] === "$" ? jp.value(rec, key) : rec[key];
    if (val === undefined)
      throw new Error("Missing key " + key);
    return val;
  }

  for (const rec of recs) {
    let slot = idx;
    for (const key of keyPath) {
      const kv = getKey(rec, key);
      slot = slot[kv] = slot[kv] || {};
    }
    const kv = getKey(rec, keyLeaf);
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
