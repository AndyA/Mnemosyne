"use strict";

const _ = require("lodash");

class MnemosyneBase {
  constructor(rec) {
    this.data = Object.assign({}, {
      raw: null
    }, rec);

    if (rec.hasOwnProperty("raw") && _.isString(rec.raw))
      this.data.raw = JSON.parse(rec.raw);
  }
}

module.exports = MnemosyneBase;
