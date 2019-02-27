"use strict";

const _ = require("lodash");
const UUID = require("lib/js/tools/uuid");
const ObjectTools = require("lib/js/tools/object-tools");

const MnemosyneBase = require("./base");

class MnemosyneDocument extends MnemosyneBase {
  constructor(doc) {
    super();
    Object.assign(this, doc);
  }

  static makeSet(rows) {
    return rows.map(r => new this(r));
  }

  toJSON() {
    return ObjectTools.getJSON(this);
  }
}

MnemosyneDocument
  .lazyAttr("link", function() {
    if (this.hasOwnProperty("pid"))
      return "/" + this.pid;
    return "/" + this._id;
  });

module.exports = MnemosyneDocument;
