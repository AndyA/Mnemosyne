"use strict";

const UUID = require("./uuid");

class UUIDMaker {
  constructor(...prefix) {
    this._prefix = prefix;
  }

  make(...info) {
    return UUID.make(...this._prefix, ...info);
  }

  uuid(...info) {
    return new UUID(this.make(...info));
  }
}

module.exports = UUIDMaker;
