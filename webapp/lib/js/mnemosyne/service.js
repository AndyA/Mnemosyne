"use strict";

const MnemosyneDocument = require("./document");

class MnemosyneService extends MnemosyneDocument {
  static get key() {
    return "service";
  }
}

MnemosyneService
  .jpAttr("name", "$.service.name[0]")
  .jpAttr("description", "$.service.description[0]");

module.exports = MnemosyneService;
