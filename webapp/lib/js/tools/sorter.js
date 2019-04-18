"use strict";

const _ = require("lodash");

function sorter(...keys) {
  function compareThing(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  function makeTerm(key) {
    if (_.isFunction(key))
      return key;

    if (!_.isString(key) || !key.length)
      throw new Error("Sort keys must be a function of a field name");

    if (key[0] === "-") {
      const tf = makeTerm(key.substr(1));
      return (a, b) => tf(b, a);
    }

    if (key[0] === "+") {
      return makeTerm(key.substr(1))
    }

    if (key[0] === "#") {
      const field = key.substr(1);
      return (a, b) => compareThing(a[field], b[field]);
    }

    return (a, b) => compareThing(a[key], b[key]);
  }

  const terms = _.flattenDeep(keys).map(makeTerm);

  return (a, b) => {
    for (const term of terms) {
      const cmp = term(a, b);
      if (cmp) return cmp;
    }
    return 0;
  }
}

module.exports = sorter;
