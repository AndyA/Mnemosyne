"use strict";

const db = require("lib/js/db");
const _ = require("lodash");
const Indexer = require("lib/js/tools/indexer");
const Pluck = require("lib/js/tools/pluck");

class MnemosyneMapper {
  async redirect(from) {
    if (_.isString(from)) {
      const r = await this.redirect([from]);
      return r[from];
    }

    if (!_.isArray(from))
      throw new Error("redirect needs a string or an array");

    const [rows, fields] = await db.query("SELECT * FROM `mnemosyne_redirect` WHERE `from` IN (?)", [from]);
    return Pluck.pluckValues(Indexer.uniqueByKey(rows, "from"), "$.to");
  }

  async lookupKind(ids) {
    if (_.isString(ids)) {
      const k = await this.lookupKind([ids]);
      return k[0];
    }

    if (!_.isArray(ids))
      throw new Error("lookupKind needs a string or an array");
  }
}

module.exports = MnemosyneMapper;
