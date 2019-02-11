"use strict";

const db = require("lib/js/db");
const _ = require("lodash");
const Indexer = require("lib/js/tools/indexer");
const Pluck = require("lib/js/tools/pluck");

class MnemosyneMapper {
  // TODO: normalize UUIDs here
  // TODO: redirect UUID to ID here
  async redirect(from) {
    if (_.isString(from)) {
      const r = await this.redirect([from]);
      return r[from];
    }

    if (!_.isArray(from))
      throw new Error("redirect needs a string or an array");

    const [rows, fields] = await db.query([
      "SELECT `r`.`from`, IFNULL(`m`.`ID`, `r`.`to`) AS `to`" +
      "  FROM `mnemosyne_redirect` AS `r`" +
      "  LEFT JOIN `mnemosyne_pips_id_map` AS `m` ON `r`.`to` = `m`.`uuid`" +
      " WHERE `r`.`from` IN (?)",
      "SELECT `uuid` AS `from`, `ID` AS `to`" +
      "  FROM `mnemosyne_pips_id_map`" +
      " WHERE `uuid` IN  (?)"
    ].join(" UNION "), [from, from]);

    return Pluck.pluckValues(Indexer.uniqueByKey(rows, "from"), "$.to");
  }

  async lookupKind(ids) {
    if (_.isString(ids)) {
      const k = await this.lookupKind([ids]);
      return k[ids];
    }

    if (!_.isArray(ids))
      throw new Error("lookupKind needs a string or an array");

    const [rows, fields] = await db.query(
      [
        "SELECT `uuid`, `ID`, `table`, ? AS `key` FROM `mnemosyne_pips_id_map` WHERE `uuid` IN (?)",
        "SELECT `uuid`, `ID`, `table`, ? AS `key` FROM `mnemosyne_pips_id_map` WHERE `ID` IN (?)"
      ].join(" UNION "),
      ["uuid", ids, "ID", ids]
    );

    let kindMap = {};
    for (const row of rows)
      kindMap[row[row.key]] = row;

    return kindMap;
  }
}

module.exports = MnemosyneMapper;
