"use strict";

const stream = require("stream");

const G2Trove = require("./trove");

class G2TroveReader extends stream.Readable {
  constructor(opt, table, sql, ...params) {
    const o = Object.assign({
      highWaterMark: 10,
      chunk: 1000
    }, opt, {
      objectMode: true
    });

    super(o);
    this.opt = o;
    this.table = table;
    this.queue = [];
    this.trove = this.table.createTrove();

    const pool = table.loader.pool;

    pool.getConnection()
      .then(conn => {
        this.conn = conn.connection;
        const q = this.conn.query(this.table.formatSQL(sql), ...params)
          .on("error", e => this.emit("error", e))
          .on("end", () => {
            this._end();
            this.conn.resume();
            pool.pool.releaseConnection(conn);
          })
          .on("result", r => this._enqueue(r));
      })
      .catch(e => this.emit("error", e));
  }

  _end() {
    if (this.queue.length)
      this._flush();
    this.push(null);
  }

  _flush() {
    let trove = this.trove;
    this.trove = this.table.createTrove();
    trove.setRawRows(this.queue);
    this.queue = [];

    if (!this.push(trove))
      this.conn.pause();
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

module.exports = G2TroveReader;
