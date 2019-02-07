"use strict";

const MnemosyneBase = require("./base");

class MnemosyneService extends MnemosyneBase {
  static get table() {
    return "mnemosyne_pips_service";
  }
}

MnemosyneService
  .jpAttr("name", "$.raw.name[0]")
  .jpAttr("description", "$.raw.description[0]");

module.exports = MnemosyneService;
