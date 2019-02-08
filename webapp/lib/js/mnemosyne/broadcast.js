"use strict";

const MnemosyneBase = require("./base");
const moment = require("moment");

class MnemosyneBroadcast extends MnemosyneBase {
  static get table() {
    return "mnemosyne_broadcast";
  }
}

MnemosyneBroadcast
  .jpAttr("txTime", {
    paths: "$.raw.published_time[*]['$'].start",
    parser: v => moment(v)
  });

module.exports = MnemosyneBroadcast;


