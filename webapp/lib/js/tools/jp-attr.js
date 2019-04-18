"use strict";

const lazyAttr = require("./lazy-attr");
const jp = require("jsonpath");
const _ = require("lodash");

function parseOptions(opt) {
  if (_.isString(opt) || _.isArray(opt))
    return parseOptions({
      paths: opt
    });

  return Object.assign({}, {
    paths: [],
    array: false,
    parser: v => v,
    transform: v => v
  }, opt);
}

function jpAttr(cl, name, opt) {
  const o = parseOptions(opt);
  const paths = _.flattenDeep([o.paths]);

  lazyAttr(cl, name, function() {
    let vals = [];
    for (const path of paths) {
      if (_.isFunction(path))
        vals.push(path.call(this, name));
      else if (path[0] === "$")
        Array.prototype.push.apply(vals, jp.query(this, path));
      else 
        vals.push(path);

      if (vals.length && !o.array)
        return o.transform.call(
          this,
          o.parser.call(this, vals[0], name),
          name
        );
    }

    if (o.array)
      return o.transform.call(
        this,
        vals.map(v => o.parser.call(this, v, name)),
        name
      );
  });
}

module.exports = jpAttr;
