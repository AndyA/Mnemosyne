"use strict";

const Promise = require("bluebird");
const db = require("lib/js/db");
const Trove = require("lib/js/tools/trove");

class MnemosyneDatabase {
  static async loadAll(cl) {
    let [rows, fields] = await db.query("SELECT * FROM `" + cl.table + "`");
    return new Trove(cl.makeSet(rows));
  }
}

module.exports = MnemosyneDatabase;
