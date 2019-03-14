"use strict";

const _ = require("lodash");

class MnemosyneVersions {
  static sameValue(a, b) {
    if (a === b) return true;
    const ja = JSON.stringify(a);
    const jb = JSON.stringify(b);
    return ja === jb;
  }

  static applyEdit(doc, before, after) {
    if (before === undefined && after === undefined)
      return doc;

    if (doc === undefined && before === undefined)
      return after;

    if (_.isPlainObject(doc) && _.isPlainObject(before) && _.isPlainObject(after)) {
      const keys = _.uniq([...Object.keys(doc), ...Object.keys(before), ...Object.keys(after)]);
      let out = {};
      for (const key of keys) {
        const ev = this.applyEdit(doc[key], before[key], after[key]);
        if (ev !== undefined)
          out[key] = ev;
      }
      return out;
    }

    if (this.sameValue(doc, before))
      return after;

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

