"use strict";

const G2Schema = require("./schema");
const G2Table = require("./table");

class G2Loader {
  constructor(pool) {
    this.pool = pool;
    this.schema = new G2Schema(require("./mnemosyne"));
    this.tables = [];
  }

  getTable(kind) {
    return this.tables[kind] = this.tables[kind] || G2Table.createTable(this, kind);
  }

}

module.exports = G2Loader;
