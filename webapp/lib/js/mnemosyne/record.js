"use strict";

const _ = require("lodash");
const lazyAttr = require("lib/js/tools/lazy-attr");
const jpAttr = require("lib/js/tools/jp-attr");
const UUID = require("lib/js/tools/uuid.js");

const MnemosyneBase = require("./base");

class MnemosyneRecord extends MnemosyneBase {
  constructor(rec) {
    super(rec);
    Object.assign(this, rec);

    if (rec.hasOwnProperty("raw") && _.isString(rec.raw))
      this.raw = JSON.parse(rec.raw);
  }

  static makeSet(rows) {
    return rows.map(r => new this(r));
  }

}

MnemosyneRecord
  .lazyAttr("link", function() {
    return this.ID || UUID.hash(this.uuid);
  });

module.exports = MnemosyneRecord;
