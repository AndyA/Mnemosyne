"use strict";

function lazyAttr(cl, name, vf) {
  Object.defineProperty(cl.prototype, name, {
    get: function() {
      if (!this.__lazy)
        this.__lazy = {};
      return this.__lazy[name] = this.__lazy[name] || vf.apply(this);
    }
  });
}

module.exports = lazyAttr;
