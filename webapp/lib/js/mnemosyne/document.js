"use strict";

const _ = require("lodash");
const UUID = require("lib/js/tools/uuid.js");

const MnemosyneBase = require("./base");

class MnemosyneDocument extends MnemosyneBase {
  constructor(doc) {
    super(doc);
    Object.assign(this, doc);

    if (doc.hasOwnProperty("raw") && _.isString(doc.raw))
      this.raw = JSON.parse(doc.raw);
  }

  static makeSet(rows) {
    return rows.map(r => new this(r));
  }

}

MnemosyneDocument
  .lazyAttr("link", function() {
    return "/" + this._id;
  });

module.exports = MnemosyneDocument;
