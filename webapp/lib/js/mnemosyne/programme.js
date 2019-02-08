"use strict";

const MnemosyneBase = require("./base");

class MnemosyneProgramme extends MnemosyneBase {
  constructor(data) {
    super(data);
    Object.assign(this, data);
  }
}

MnemosyneProgramme
  .jpAttr("txTime", "$.broadcast.txTime");

module.exports = MnemosyneProgramme;
