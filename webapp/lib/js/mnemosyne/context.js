"use strict";

const db = require("lib/js/db");
const lazyAttr = require("lib/js/tools/lazy-attr");
const MnemosyneService = require("lib/js/mnemosyne/service");
const MnemosyneMasterBrand = require("lib/js/mnemosyne/master-brand");
const Trove = require("lib/js/tools/trove");

class MnemosyneContext {
  async loadAll(cl) {
    let [rows, fields] = await db.query("SELECT * FROM `" + cl.table + "`");
    return new Trove(cl.makeSet(rows));
  }
}

lazyAttr(MnemosyneContext, "services", function() {
  return this.loadAll(MnemosyneService);
});

lazyAttr(MnemosyneContext, "masterBrands", function() {
  return this.loadAll(MnemosyneMasterBrand);
});

module.exports = MnemosyneContext;
