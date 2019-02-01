"use strict";

const lazyAttr = require("./lazy-attr");
const jp = require("jsonpath");

function parseOptions(opt) {
  if (Array.isArray(opt))
    return parseOptions({
      paths: opt
    });

  return Object.assign({}, {
    paths: [],
    array: false
  }, opt);
}

function jpAttr(cl, name, opt) {
  const o = parseOptions(opt);

  if (o.array) {

    // Return an array containing all matches
    lazyAttr(cl, name, function() {
      let vals = [];
      for (const path of o.paths) {
        Array.prototype.push.apply(vals, jp.query(this, path));
      }
      return vals;
    });

  } else {

    // Return the first match
    lazyAttr(cl, name, function() {
      let vals = [];
      for (const path of o.paths) {
        let vals = jp.query(this, path);
        if (vals.length) return vals[0];
      }
    });

  }
}

module.exports = jpAttr;
