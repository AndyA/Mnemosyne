"use strict";

const assert = require("assert");
const _ = require("lodash");
const Promise = require("bluebird");

const Trove = require("lib/js/tools/trove");

class G2Schema {
  constructor(schema) {
    // Deep clone
    this.schema = JSON.parse(JSON.stringify(schema));
    this.addHasRelations();
  }

  addHasRelations() {
    for (const [kind, info] of Object.entries(this.schema)) {
      if (info.child_of) {
        for (const [parent, column] of Object.entries(info.child_of)) {
          let parentInfo = this.infoFor(parent);
          (parentInfo.has = parentInfo.has || {})[kind] = column;
        }
      }
    }
  }

  infoFor(kind) {
    assert(this.schema[kind], kind + " unknown");
    return this.schema[kind];
  }
}

class G2Trove extends Trove {
  constructor(loader, kind, rows) {
    super([]);

    this.loader = loader;
    this.kind = kind;

    this.info = this.infoFor(kind);
    this.pool = this.loader.pool;

    this.rows = (rows || []).map(r => this.decodeRow(r));
  }

  async loadQuery(...query) {
    const [res, cols] = await this.pool.query(...query);
    this.rows = res.map(r => this.decodeRow(r));
    return this;
  }

  async loadQueryDeep(...query) {
    await this.loadQuery(...query);
    return this.expandAllChildren();
  }

  async loadByColumn(col, vals) {
    const sql = [`SELECT * FROM \`${this.info.table}\` WHERE \`${col}\` IN (?)`];

    if (this.info.order) {
      sql.push("ORDER BY");
      sql.push(this.parseOrder(this.info.order));
    }

    return this.loadQueryDeep(sql.join(" "), [vals]);
  }

  infoFor(kind) {
    return this.loader.schema.infoFor(kind);
  }

  decodeRow(row) {
    let out = Object.assign({}, row);
    for (const js of this.info.json || [])
      out[js] = JSON.parse(out[js]);
    return out;
  }

  pluck(key) {
    return this.rows.map(r => r[key]);
  }

  pluckUnique(key) {
    return _.uniq(this.pluck(key));
  }

  parseOrder(...order) {
    const parts = _.flattenDeep(order).join(",").split(/\s*,\s*/);
    return parts.map(p => {
      switch (p[0]) {
        case '-':
          return "`" + p.substr(1) + "` DESC";
        case '+':
          return "`" + p.substr(1) + "` ASC";
        default:
          return "`" + p + "`";
      }
    }).join(", ");
  }

  async expandChild(key) {
    assert(this.info.has && this.info.has[key], "no child called " + key);
    const me = this.constructor;
    const childInfo = this.infoFor(key);
    const fk = this.info.has[key];
    const pk = this.pluckUnique(this.info.pkey);
    if (pk.length === 0) return;

    let kids = await (new me(this.loader, key)).loadByColumn(fk, pk);

    for (let row of this.rows) {
      row[childInfo.plural || key] = kids.findAll(fk, row[this.info.pkey]).map(k => {
        let ko = Object.assign({}, k);
        delete ko[fk];
        return ko;
      });
    }
    return this;
  }

  async expandAllChildren() {
    await Promise.all(
      Object.keys(this.info.has || {}).map(key => this.expandChild(key)));
    return this;
  }
}

class G2Loader {
  constructor(pool) {
    this.pool = pool;
    this.schema = new G2Schema(require("./schema"));
  }
}

module.exports = {
  G2Schema,
  G2Trove,
  G2Loader
};
