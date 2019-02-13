"use strict";

const MnemosyneDocument = require("./document");
const moment = require("moment");
require("lib/js/mnemosyne/time");

class MnemosyneBroadcast extends MnemosyneDocument {
  static get table() {
    return "mnemosyne_broadcast";
  }
}

MnemosyneBroadcast
  .jpAttr("txTime", {
    paths: "$.broadcast.published_time[*]['$'].start",
    parser: v => moment.utc(v)
  });

module.exports = MnemosyneBroadcast;


