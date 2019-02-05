"use strict";

class MnemosyneBase {
  constructor(rec) {
    this.data = Object.assign({}, rec, {
      raw: JSON.parse(rec.raw || "null"),
    });
  }
}

module.exports = MnemosyneBase;
