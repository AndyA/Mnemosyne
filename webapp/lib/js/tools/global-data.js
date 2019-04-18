"use strict";

const _ = require("lodash");
const assert = require("assert");
const Promise = require("bluebird");
const EventEmitter = require("events");

class GlobalData extends EventEmitter {
  constructor(opt) {
    super();

    const parseOpt = opt => {
      if (_.isNumber(opt)) return parseOpt({
          ttl: opt
        });

      return Object.assign({
        ttl: 60000,
        stale: true
      }, opt || {});
    }

    this.opt = parseOpt(opt);
    this.cache = {};
  }

  destroy() {
    for (const key of this.keys())
      this.remove(key);
  }

  keys() {
    return Object.keys(this.cache);
  }

  has(key) {
    return this.cache[key] !== undefined;
  }

  add(key, opt, vf) {
    if (arguments.length === 2)
      return this.add(key, {}, opt);

    if (_.isNumber(opt))
      return this.add(key, {
        ttl: opt
      }, vf);

    assert(!this.has(key), key + " already defined");
    assert(_.isFunction(vf), key + " needs a value function");

    this.cache[key] = Object.assign({}, this.opt, {
      vf
    }, opt);

    return this;
  }

  remove(key) {
    let obj = this.cache[key];
    assert(obj, key + " not defined");
    delete this.cache[key];
    if (obj.timeout)
      clearTimeout(obj.timeout);
    return this;
  }

  get(key) {
    let obj = this.cache[key];
    assert(obj, key + " not defined");

    if (obj.value !== undefined && !obj.value.isPending())
      return obj.value;

    if (obj.value === undefined) {
      obj.value = Promise.resolve(obj.vf(key)).then(v => {
        delete obj.staleValue;
        this.emit("refresh", key, v);
        obj.timeout = setTimeout(() => {
          this.emit("evict", key);
          // Stash stale value so we can return it pending refresh
          if (obj.stale)
            obj.staleValue = obj.value;

          delete obj.value;
          delete obj.timeout;

        }, obj.ttl);
        return v;
      });
    }

    if (obj.staleValue !== undefined)
      return obj.staleValue;

    return obj.value;
  }
}

module.exports = GlobalData;
