"use strict";

function isBindable(func) {
  return func.hasOwnProperty('prototype');
}

function lazyAttr(cl, name, vf) {
  if (!isBindable(vf))
    throw new Error("lazy function is not bindable");
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
