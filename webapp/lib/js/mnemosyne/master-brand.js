"use strict";

const MnemosyneDocument = require("./document");

class MnemosyneMasterBrand extends MnemosyneDocument {
  static get key() {
    return "masterBrand";
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
