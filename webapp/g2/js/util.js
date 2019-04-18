"use strict";

const _ = require("lodash");

class G2Util {

  static quoteName(n) {
    return "`" + n + "`";
  }

  static parseOrder(...order) {
    const parts = _.flattenDeep(order).join(",").split(/\s*,\s*/);
    return parts.map(p => {
      switch (p[0]) {
        case '-':
          return this.quoteName(p.substr(1)) + " DESC";
        case '+':
          return this.quoteName(p.substr(1)) + " ASC";
        default:
          return this.quoteName(p);
      }
    }).join(", ");
  }

}

module.exports = G2Util;
