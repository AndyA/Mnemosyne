"use strict";

const MnemosyneRecord = require("./record");
const moment = require("moment");

class MnemosyneBroadcast extends MnemosyneRecord {
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


