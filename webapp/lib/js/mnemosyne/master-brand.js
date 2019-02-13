"use strict";

const MnemosyneDocument = require("./document");

class MnemosyneMasterBrand extends MnemosyneDocument {
  static get table() {
    return "mnemosyne_pips_master_brand";
  }
}

MnemosyneMasterBrand
  .jpAttr("name", "$.raw.name[0]")
  .jpAttr("title", "$.raw.title[0]")
  .jpAttr("images", {
    paths: "$.raw.images[*].image[*]['$']",
    array: true
  });

module.exports = MnemosyneMasterBrand;
