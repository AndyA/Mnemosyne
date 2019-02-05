"use strict";

const _ = require("lodash");
const jpAttr = require("lib/js/tools/jp-attr");

class MnemosyneBase {
  constructor(rec) {
    this.data = Object.assign({}, {
      raw: null
    }, rec);

    if (rec.hasOwnProperty("raw") && _.isString(rec.raw))
      this.data.raw = JSON.parse(rec.raw);
  }
}

jpAttr(MnemosyneBase, "ID", "$.data.ID");
jpAttr(MnemosyneBase, "uuid", "$.data.uuid");

module.exports = MnemosyneBase;
