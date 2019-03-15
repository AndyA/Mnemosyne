"use strict";

const _ = require("lodash");
const Promise = require("bluebird");

const Trove = require("lib/js/tools/trove");
const UUID = require("lib/js/tools/uuid");
const GV = require("lib/js/mnemosyne/versions");
const G2Document = require("./document");

class G2Trove extends Trove {
  constructor(table, rows) {
    super(rows || []);

    this.table = table;
    this.loader = table.loader;
    this.kind = table.kind;

    this.pool = this.loader.pool;
    this.info = this.table.infoFor(this.kind);
  }

  static get documentClass() {
    return G2Document;
  }

  setRawRows(rows) {
    this.rows = rows.map(r => this.decodeRow(r));
    return this;
  }

  formatSQL(sql) {
    return this.table.formatSQL(sql);
  }

  async query(sql, ...params) {
    return this.table.query(sql, ...params);
  }

  async loadQuery(sql, ...params) {
    const [res, cols] = await this.query(sql, ...params);
    return this.setRawRows(res);
  }

  async loadQueryDeep(sql, ...params) {
    await this.loadQuery(sql, ...params);
    return this.expandAllChildren();
  }

  async loadByColumn(col, vals) {
    const sql = [`SELECT * FROM @self WHERE \`${col}\` IN (?)`];

    if (this.info.order) {
      sql.push("ORDER BY");
      sql.push(this.parseOrder(this.info.order));
    }


    return this.loadQueryDeep(sql.join(" "), [vals]);
  }

  async loadByID(id) {
    return this.loadByColumn(this.info.pkey, id);
  }

  decodeRow(row) {
    let out = Object.assign({}, row);
    for (const js of this.info.json || [])
      out[js] = JSON.parse(out[js]);
    return out;
  }

  pluck(key) {
    return this.rows.map(r => {
      if (r.mnemosyne)
        return r.mnemosyne[key];
      return r[key]
    });
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
    const me = this.constructor;
    const childInfo = this.table.infoFor(key);
    const fk = this.info.has[key];
    const pk = this.pluckUnique(this.info.pkey);
    if (pk.length === 0) return;

    const t = this.loader.getTable(key).createTrove();
    let kids = await t.loadByColumn(fk, pk);

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

  _getRow(row) {
    if (row.mnemosyne) return row;

    const pk = row[this.info.pkey];

    let newRow = {
      _id: UUID.hash(pk),
      mnemosyne: Object.assign(row),
      kind: this.kind
    };

    if (newRow.mnemosyne.versions) {
      newRow.versions = newRow.mnemosyne.versions;
      delete newRow.mnemosyne.versions;
    }


    const documentClass = this.constructor.documentClass;
    return new documentClass(GV.numify(newRow));
  }

  getData() {
    return this.table.createTrove(
      this.rows.map(row => {
        return this._getRow(row);
      }));
  }
}

module.exports = G2Trove;
