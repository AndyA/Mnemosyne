"use strict";

const _ = require("lodash");
const assert = require("assert");
const Promise = require("bluebird");

class GlobalData {
  constructor(opt) {
    const parseOpt = opt => {
      if (_.isNumber(opt)) return parseOpt({
          interval: opt
        });
      return Object.assign({
        interval: 1000,
        ttl: 60000
      }, opt || {});
    }

    this.opt = parseOpt(opt);
    this.cache = {};

    const periodic = () => {
      this.now = new Date().getTime();
      for (let obj of Object.values(this.cache)) {
        if (obj.hasOwnProperty("expires") && obj.expires <= this.now) {
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
      return Object.assign({
        ttl: this.opt.ttl,
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
    if (obj.hasOwnProperty("value"))
      return obj.value;
    return obj.value = Promise.resolve(obj.vf(key)).then(v => {
      obj.expires = this.now + obj.ttl;
      return v;
    });
  }
}

module.exports = GlobalData;
