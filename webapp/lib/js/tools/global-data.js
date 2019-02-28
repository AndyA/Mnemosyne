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
    for (const obj of Object.values(this.cache)) {
      if (obj.timeout)
        clearTimeout(obj.timeout);
    }
  }

  add(key, opt, vf) {
    const parseOpt = opt => {
      if (_.isNumber(opt)) return parseOpt({
          ttl: opt
        });

      return Object.assign({}, this.opt, {
        vf
      }, opt);
    }

    assert(!this.cache.hasOwnProperty(key), key + " already defined");

    this.cache[key] = parseOpt(opt);
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
