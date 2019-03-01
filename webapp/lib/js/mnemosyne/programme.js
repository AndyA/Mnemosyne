"use strict";

const MnemosyneDocument = require("./document");

class MnemosyneProgramme extends MnemosyneDocument {
  static get key() {
    return "programme";
  }
}

MnemosyneProgramme
  .jpAttr("title", "$.episode.title")
  .jpAttr("link", "$.broadcast.link")
  .jpAttr("txTime", "$.broadcast.txTime")
  .jpAttr("serviceName", "$.service.name");

module.exports = MnemosyneProgramme;
