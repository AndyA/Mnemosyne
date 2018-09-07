"use strict";

const md5 = require('md5');

class MnemosyneHash {
  static formatUUID(hash) {
    return [
      hash.substr(0, 8),
      hash.substr(8, 4),
      hash.substr(12, 4),
      hash.substr(16, 4),
      hash.substr(20)].join("-").toLowerCase();
  }

  static createHash(values) {
    values.unshift("Mnemosyne");
    return md5(values.join("\t"));
  }

  static createUUID(values) {
    return this.formatUUID(this.createHash(values));
  }
}

module.exports = MnemosyneHash;

