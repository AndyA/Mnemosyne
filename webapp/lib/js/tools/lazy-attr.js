"use strict";

function lazyAttr(cl, name, vf) {
  Object.defineProperty(cl.prototype, name, {
    get: function() {
      if (!this._lazy)
        this._lazy = {};
      return this._lazy[name] = this._lazy[name] || vf.apply(this);
    }
  });
}

module.exports = lazyAttr;
