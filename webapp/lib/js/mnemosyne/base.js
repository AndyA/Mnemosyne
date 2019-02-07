"use strict";

const _ = require("lodash");
const jpAttr = require("lib/js/tools/jp-attr");

class MnemosyneBase {
  constructor(rec) {
    Object.assign(this, {
      raw: null
    }, rec);

    if (rec.hasOwnProperty("raw") && _.isString(rec.raw))
      this.raw = JSON.parse(rec.raw);
  }
}

module.exports = MnemosyneBase;
