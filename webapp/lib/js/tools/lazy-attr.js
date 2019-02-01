"use strict";

function lazyAttr(cl, name, vf) {
  Object.defineProperty(cl.prototype, name, {
    get: function() {
      if (!this._lazy)
        this._lazy = {};
      if (this._lazy.hasOwnProperty(name))
        return this._lazy[name];
      return this._lazy[name] = vf.call(this, name);
    }
  });
}

module.exports = lazyAttr;
