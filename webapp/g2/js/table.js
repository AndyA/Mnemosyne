"use strict";

const Indexer = require("lib/js/tools/indexer");
const Pluck = require("lib/js/tools/pluck");
const _ = require("lodash");

const G2Trove = require("./trove");
const G2Util = require("./util");

const kindMap = {
  default: require("./general-trove"),
  programme: require("./programme-trove"),
};

class G2Table {
  static async createTable(loader, kind) {
    let me = new this(loader, kind);
    const m = await me._makeMeta();
    me._meta = m;
    return me;
  }

  constructor(loader, kind) {
    this.loader = loader;
    this.kind = kind;

    this.info = this.infoFor(kind);
    this.pool = this.loader.pool;
    this._byType = [];
  }

  async _makeMeta() {
    const [fieldList, indexList] = await Promise.all([
      this.query("DESCRIBE @self").then(([fieldList]) => fieldList),
      this.query("SHOW INDEXES FROM @self").then(([indexList]) => indexList),
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

  get meta() {
    if (!this._meta)
      throw new Error("G2Table has no meta. Did you make it using G2Table.createTable?");
    return this._meta;
  }

  _troveClass() {
    const cl = kindMap[this.kind] || kindMap["default"];
    if (!cl)
      throw new Error("Can't map kind " + this.kind);
    return cl;
  }

  createTrove(rows) {
    const cl = this._troveClass();
    return new cl(this, rows);
  }

  infoFor(kind) {
    return this.loader.schema.infoFor(kind);
  }

  formatSQL(sql) {
    const stash = {
      self: G2Util.quoteName(this.info.table),
      key: G2Util.quoteName(this.info.pkey),
      order: this.info.order ? "ORDER BY " + G2Util.parseOrder(this.info.order) : "",
    };

    return _.flattenDeep([sql]).join(" ").replace(/@(\w+)/g, (m, name) => {
      if (stash[name] === undefined)
        throw new Error("@" + name + " not known");
      return stash[name];
    });
  }

  async query(sql, ...params) {
    const sqlQuery = this.formatSQL(sql);
    //    console.log("QUERY: " + sqlQuery + " (" + JSON.stringify(params) + ")");
    return this.pool.query(sqlQuery, ...params);
  }

  filterFields(pred) {
    return Object.entries(this.meta.fields)
      .filter(([field, info]) => pred(info, field))
      .map(([field, info]) => field);
  }

  fieldsByType(type) {
    return this._byType[type] = this._byType[type] || this.filterFields((i, f) => i.type === type);
  }
}

module.exports = G2Table;
