"use strict";

const jpAttr = require("lib/js/tools/jp-attr");
const lazyAttr = require("lib/js/tools/lazy-attr");

class MnemosyneProgramme {
  constructor(data) {
    Object.assign(this, data);
  }
}

jpAttr(MnemosyneProgramme, "txTime", "$.broadcast.txTime");

lazyAttr(MnemosyneProgramme, "displayTime", function() {
  return this.txTime.format("HH:mm");
});

module.exports = MnemosyneProgramme;
