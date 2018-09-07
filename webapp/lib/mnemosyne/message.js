"use strict";

const MnemosyneHash = require("./hash.js");
const MnemosyneData = require("./data.js");

class MnemosyneMessage extends MnemosyneData {
  constructor(msg) {
    super(msg);
  }

  static fromLog(log) {
    return log.map(msg => new MnemosyneMessage(msg));
  }
}

module.exports = MnemosyneMessage;
