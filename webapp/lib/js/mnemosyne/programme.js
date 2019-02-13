"use strict";

const MnemosyneBase = require("./base");

class MnemosyneProgramme extends MnemosyneBase {
  static get key() {
    return "programme";
  }

  constructor(data) {
    super(data);
    Object.assign(this, data);
  }
}

MnemosyneProgramme
  .jpAttr("title", "$.episode.title")
  .jpAttr("link", "$.broadcast.link")
  .jpAttr("txTime", "$.broadcast.txTime");

module.exports = MnemosyneProgramme;
