"use strict";

const MnemosyneBase = require("./base");
const jpAttr = require("lib/js/tools/jp-attr");

class MnemosyneMasterBrand extends MnemosyneBase {
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
