"use strict";

const _ = require("lodash");

class MnemosyneVersions {
  static numify(obj) {
    function n(obj) {
      if (obj === null || obj === undefined)
        return obj;
      if (_.isString(obj) && !isNaN(obj))
        return +obj;
      if (_.isArray(obj))
        return obj.map(n);
      if (_.isPlainObject(obj))
        return _.mapValues(obj, n);
      return obj;
    }
    return n(obj);
  }

  static sameValue(a, b) {
    return _.isEqual(a, b);
  }

  static applyEdit(doc, before, after, force = false) {
    if (before === undefined && after === undefined)
      return doc;

    if (doc === undefined && before === undefined)
      return after;

    if (_.isPlainObject(doc) && _.isPlainObject(before) && _.isPlainObject(after)) {
      const keys = _.uniq([...Object.keys(doc), ...Object.keys(before), ...Object.keys(after)]);
      let out = {};
      for (const key of keys) {
        const ev = this.applyEdit(doc[key], before[key], after[key], force);
        if (ev !== undefined)
          out[key] = ev;
      }
      return out;
    }

    if (force || this.sameValue(doc, before))
      return after;

    console.log("VALUE MISMATCH:", JSON.stringify({
      doc,
      before,
      after,
      diff: this.deepDiff(doc, before)
    }, null, 2));

    throw new Error("Previous value mismatch");
  }

  static _diff(before, after, result) {
    if (this.sameValue(before, after))
      return;

    if (!_.isPlainObject(before) || !_.isPlainObject(after)) {
      result.before = before;
      result.after = after;
      return;
    }

    result.before = {};
    result.after = {};

    const keys = _.uniq([...Object.keys(before), ...Object.keys(after)]);
    for (const key of keys) {
      const diff = this.deepDiff(before[key], after[key]);
      for (const slot of ["before", "after"]) {
        if (diff[slot] !== undefined) {
          result[slot][key] = diff[slot];
        }
      }
    }
  }

  static deepDiff(before, after) {
    let result = {};
    this._diff(before, after, result);
    return result;
  }
}

module.exports = MnemosyneVersions;

