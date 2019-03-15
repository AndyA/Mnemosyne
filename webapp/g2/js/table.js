"use strict";

const Indexer = require("lib/js/tools/indexer");
const Pluck = require("lib/js/tools/pluck");

const G2Trove = require("./trove");

class G2Table {
  constructor(loader, kind) {
    this.loader = loader;
    this.kind = kind;

    this.info = this.infoFor(kind);
    this.pool = this.loader.pool;
  }

  createTrove(rows) {
    return new G2Trove(this, rows);
  }

  infoFor(kind) {
    return this.loader.schema.infoFor(kind);
  }

  formatSQL(sql) {
    const stash = {
      self: this.info.table,
      key: this.info.pkey
    };

    return sql.replace(/@(\w+)/g, (m, name) => {
      if (stash[name] === undefined)
        throw new Error("@" + name + " not known");
      return stash[name];
    });
  }

  async query(sql, ...params) {
    const sqlQuery = this.formatSQL(sql);
    //    console.log("QUERY: " + sqlQuery, params);
    return this.pool.query(sqlQuery, ...params);
  }

  async _makeMeta() {
    const [fieldList, indexList] = await Promise.all([
      this.trove.query("DESCRIBE @self").then(([fieldList]) => fieldList),
      this.trove.query("SHOW INDEXES FROM @self").then(([indexList]) => indexList),
    ]);

    const fields = Pluck.pluckValues(Indexer.uniqueByKey(fieldList, "Field"), {
      type: "$.Type",
      null: v => v === "YES",
      key: "$.Key",
      extra: "$.Extra"
    });

    const indexes = Indexer.allByKey(indexList.filter(i => fields[i.Column_name]), "Key_name", "Column_name");

    return {
      fields,
      indexes,
    };
  }

  async getMeta() {
    return this._meta = this._meta || this._makeMeta();
  }

  async filterFields(pred) {
    const meta = await this.getMeta();
    return Object.entries(meta.fields)
      .filter(([field, info]) => pred(info, field))
      .map(([field, info]) => field);
  }
}

module.exports = G2Table;
