"use strict";

const assert = require("assert");
const _ = require("lodash");
const Promise = require("bluebird");
const stream = require("stream");

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

  getRoots() {
    return Object.entries(this.schema)
      .filter(([kind, info]) => !info.child_of && info.pkey)
      .map(([kind, info]) => kind)
      .sort();
  }
}

class G2TroveReader extends stream.Readable {
  constructor(opt, loader, kind, sql, ...params) {
    const o = Object.assign({
      highWaterMark: 10,
      chunk: 1000
    }, opt, {
      objectMode: true
    });

    super(o);
    this.opt = o;
    this.loader = loader;
    this.kind = kind;
    this.queue = [];
    this.trove = this._makeTrove();

    const pool = this.loader.pool;

    pool.getConnection()
      .then(conn => {
        this.conn = conn.connection;
        const q = this.conn.query(this.trove.formatSQL(sql), ...params)
          .on("error", e => this.emit("error", e))
          .on("end", () => {
            this._end();
            this.conn.resume();
            pool.pool.releaseConnection(conn);
          })
          .on("result", r => this._enqueue(r));
      });
  }

  _makeTrove() {
    return new G2Trove(this.loader, this.kind);
  }

  _end() {
    if (this.queue.length)
      this._flush();
    this.push(null);
  }

  _flush() {
    let trove = this.trove;
    this.trove = this._makeTrove();

    trove.setRawRows(this.queue);
    if (!this.push(trove))
      this.conn.pause();
    this.queue = [];
  }

  _enqueue(r) {
    this.queue.push(r);
    if (this.queue.length >= this.opt.chunk)
      this._flush();
  }

  _read(size) {
    if (this.conn)
      this.conn.resume();
  }
}

class G2TroveTransform extends stream.Transform {
  constructor(worker) {
    super({
      objectMode: true
    });
    this.worker = worker;
  }

  _transform(trove, encoding, callback) {
    this.worker(trove)
      .then(t => {
        this.push(trove);
        callback()
      })
      .catch(e => callback(e));
  }
}

class G2TroveExpander extends G2TroveTransform {
  constructor() {
    super(trove => trove.expandAllChildren());
  }
}

class G2Trove extends Trove {
  constructor(loader, kind) {
    super([]);

    this.loader = loader;
    this.kind = kind;

    this.info = this.infoFor(kind);
    this.pool = this.loader.pool;
  }

  setRawRows(rows) {
    this.rows = rows.map(r => this.decodeRow(r));
    return this;
  }

  formatSQL(sql) {
    return sql.replace(/@self/g, "`" + this.info.table + "`");
  }

  async loadQuery(sql, ...params) {
    const sqlQuery = this.formatSQL(sql);
    //    console.log("QUERY: " + sqlQuery, params);
    const [res, cols] = await this.pool.query(sqlQuery, ...params);
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

  _shapeRow(row) {
    if (row.mnemosyne) return row;
    let newRow = {
      mnemosyne: row,
      kind: this.kind
    };

    if (newRow.mnemosyne.versions) {
      newRow.versions = newRow.mnemosyne.versions;
      delete newRow.mnemosyne.versions;
    }

    return newRow;
  }

  _translateVersions(row) {
    if (!row.versions || !row.versions.length)
      return row;
    return row;
  }

  shapeData() {
    this.rows = this.rows.map(row => {
      return this._translateVersions(this._shapeRow(row));
    });
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
  G2TroveReader,
  G2TroveExpander,
  G2Trove,
  G2Loader
};
