"use strict";

const MnemosyneDocument = require("./document");
const moment = require("moment");
require("lib/js/mnemosyne/time");

class MnemosyneBroadcast extends MnemosyneDocument {
  static get key() {
    return "broadcast";
  }
}

MnemosyneBroadcast
  .jpAttr("txTime", {
    paths: "$.broadcast.published_time[*]['$'].start",
    parser: v => moment.fromStore(v)
  });

module.exports = MnemosyneBroadcast;


