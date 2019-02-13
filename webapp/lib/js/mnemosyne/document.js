"use strict";

const _ = require("lodash");
const UUID = require("lib/js/tools/uuid.js");

const MnemosyneBase = require("./base");

class MnemosyneDocument extends MnemosyneBase {
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

MnemosyneDocument
  .lazyAttr("link", function() {
    return "/" + (this.ID || UUID.hash(this.uuid));
  });

module.exports = MnemosyneDocument;
