"use strict";

const jp = require("jsonpath");
const _ = require("lodash");

// Create a data structure using values plucked from another
//
// shape is a jsonpath, array of jsonpaths or object with jsonpath strings as values
// data is an object

class Pluck {
  static pluck(data, shape) {
    if (_.isArray(data))
      return data
        .map(i => this.pluck(i, shape))
        .filter(i => i !== undefined);

    if (_.isFunction(shape))
      return shape(data);

    if (_.isString(shape))
      return jp.value(data, shape);

    if (_.isArray(shape))
      return shape.map(path => this.pluck(data, path));

    if (_.isObject(shape)) {
      const keys = Object.keys(shape);
      let out = {};
      for (const key of keys) {
        const val = this.pluck(data, shape[key]);
        if (val !== undefined)
          out[key] = val;
      }
      return out;
    }

    throw new Error("Bad shape");
  }

  static pluckValues(obj, shape) {
    const keys = Object.keys(obj);
    let out = {};
    for (const key of keys)
      out[key] = this.pluck(obj[key], shape);
    return out;
  }
}

module.exports = Pluck;
