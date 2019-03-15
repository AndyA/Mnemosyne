"use strict";

const _ = require("lodash");
const Promise = require("bluebird");

const Trove = require("lib/js/tools/trove");
const UUID = require("lib/js/tools/uuid");
const GV = require("lib/js/mnemosyne/versions");
const G2Document = require("./document");
const G2Util = require("./util");

class G2Trove extends Trove {
  constructor(table, rows) {
    super(rows || []);

    this.table = table;
    this.info = this.table.info;
  }

  static get documentClass() {
    return G2Document;
  }

  get dateTimeFields() {
    return this.table.fieldsByType("datetime");
  }

  decodeRow(row) {
    let out = Object.assign({}, row);
    for (const js of this.info.json || [])
      out[js] = JSON.parse(out[js]);
    return out;
  }

  setRawRows(rows) {
    this.rows = rows.map(r => this.decodeRow(r));
    return this;
  }

  async loadQuery(sql, ...params) {
    const [res, cols] = await this.table.query(sql, ...params);
    return this.setRawRows(res);
  }

  async loadQueryDeep(sql, ...params) {
    await this.loadQuery(sql, ...params);
    return this.expandAllChildren();
  }

  async loadByColumn(col, vals) {
    return this.loadQueryDeep(["SELECT * FROM @self WHERE ", G2Util.quoteName(col), " IN (?) @order"], [vals]);
  }

  async loadByID(id) {
    return this.loadQueryDeep("SELECT * FROM @self WHERE @key IN (?)", [vals]);
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

  async expandChild(key) {
    const me = this.constructor;
    const childInfo = this.table.infoFor(key);
    const fk = this.info.has[key];
    const pk = this.pluckUnique(this.info.pkey);
    if (pk.length === 0) return;

    const t = (await this.table.loader.getTable(key)).createTrove();
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
      kind: this.table.kind
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
