"use strict";

const MnemosyneBase = require("./base");
const jpAttr = require("lib/js/tools/jp-attr");

class MnemosyneService extends MnemosyneBase {

}

jpAttr(MnemosyneService, "name", "$.raw.name[0]");
jpAttr(MnemosyneService, "description", "$.raw.description[0]");

module.exports = MnemosyneService;
