"use strict";

const lazyAttr = require("lib/js/tools/lazy-attr");
const MnemosyneDatabase = require("lib/js/mnemosyne/database");
const MnemosyneService = require("lib/js/mnemosyne/service");
const MnemosyneMasterBrand = require("lib/js/mnemosyne/master-brand");

class MnemosyneContext {
} 

lazyAttr(MnemosyneContext, "services", () => {
  return MnemosyneDatabase.loadAll(MnemosyneService);
});

lazyAttr(MnemosyneContext, "masterBrands", () => {
  return MnemosyneDatabase.loadAll(MnemosyneMasterBrand);
});

module.exports = MnemosyneContext;
