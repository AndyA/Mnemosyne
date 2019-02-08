"use strict";

const MnemosyneRecord = require("./record");

class MnemosyneMasterBrand extends MnemosyneRecord {
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
