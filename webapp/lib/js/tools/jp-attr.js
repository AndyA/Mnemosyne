"use strict";

const lazyAttr = require("./lazy-attr");
const jp = require("jsonpath");
const _ = require("lodash");

function parseOptions(opt) {
  if (_.isArray(opt))
    return parseOptions({
      paths: opt
    });

  return Object.assign({}, {
    paths: [],
    array: false,
    parser: v => v
  }, opt);
}

function jpAttr(cl, name, opt) {
  const o = parseOptions(opt);

  lazyAttr(cl, name, function() {
    let vals = [];
    for (const path of o.paths) {
      if (_.isFunction(path))
        vals.push(path.call(this, name));
      else
        Array.prototype.push.apply(vals, jp.query(this, path));

      if (vals.length && !o.array)
        return o.parser.call(this, vals[0], name);
    }

    if (o.array)
      return vals.map(v => o.parser.call(this, v, name));
  });
}

module.exports = jpAttr;
