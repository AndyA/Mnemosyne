"use strict";

const G2Trove = require("./trove");
const moment = require("lib/js/mnemosyne/time");

const ZONE = "Europe/London";

class G2GeneralTrove extends G2Trove {
  decodeRow(row) {
    let r = super.decodeRow(row);
    for (const f of this.dateTimeFields)
      r[f] = moment.tz(r[f], ZONE).toStore();
    return r;
  }
}

module.exports = G2GeneralTrove;
