"use strict";

const _ = require("lodash");
const lazyAttr = require("lib/js/tools/lazy-attr");
const jpAttr = require("lib/js/tools/jp-attr");
const UUID = require("lib/js/tools/uuid.js");

class MnemosyneBase {
  static lazyAttr(name, ...args) {
    lazyAttr(this, name, ...args);
    return this;
  }

  static jpAttr(name, ...args) {
    jpAttr(this, name, ...args);
    return this;
  }
}

module.exports = MnemosyneBase;
