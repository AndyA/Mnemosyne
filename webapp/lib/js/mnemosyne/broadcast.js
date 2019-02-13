"use strict";

const MnemosyneDocument = require("./document");
const moment = require("moment");

class MnemosyneBroadcast extends MnemosyneDocument {
  static get table() {
    return "mnemosyne_broadcast";
  }
}

MnemosyneBroadcast
  .jpAttr("txTime", {
    paths: "$.broadcast.published_time[*]['$'].start",
    parser: v => moment(v)
  });

module.exports = MnemosyneBroadcast;


