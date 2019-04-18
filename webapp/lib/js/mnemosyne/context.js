"use strict";

const nano = require("nano");
const config = require("config");

class MnemosyneContext {
  constructor() {
    this.db = nano(Object.assign({}, config.get("db")));
  }

  destroy() {
    this.gd.destroy();
  }

}

module.exports = MnemosyneContext;
