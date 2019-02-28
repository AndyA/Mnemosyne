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
          interval: opt
        });
      return Object.assign({
        interval: 1000,
        ttl: 60000,
        stale: true
      }, opt || {});
    }

    this.opt = parseOpt(opt);
    this.cache = {};

    const periodic = () => {
      this.now = new Date().getTime();
      for (let obj of Object.values(this.cache)) {
        if (obj.expires !== undefined && obj.expires <= this.now) {
          // Stash stale value so we can return it pending refresh
          this.emit("evict", obj);
          if (obj.stale)
            obj.staleValue = obj.value;
          delete obj.value;
          delete obj.expires;
        }
      }
    }
    periodic();
    this.timer = setInterval(periodic, this.opt.interval);
  }

  destroy() {
    clearInterval(this.timer);
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
        obj.expires = this.now + obj.ttl;
        delete obj.staleValue;
        return v;
      });
    }

    if (obj.staleValue !== undefined)
      return obj.staleValue;

    return obj.value;
  }
}

module.exports = GlobalData;
