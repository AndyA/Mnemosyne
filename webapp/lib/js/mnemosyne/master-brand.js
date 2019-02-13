"use strict";

const MnemosyneDocument = require("./document");

class MnemosyneMasterBrand extends MnemosyneDocument {
  static get table() {
    return "mnemosyne_pips_master_brand";
  }
}

MnemosyneMasterBrand
  .jpAttr("name", "$.masterBrand.name[0]")
  .jpAttr("title", "$.masterBrand.title[0]")
  .jpAttr("images", {
    paths: "$.masterBrand.images[*].image[*]['$']",
    array: true
  });

module.exports = MnemosyneMasterBrand;
