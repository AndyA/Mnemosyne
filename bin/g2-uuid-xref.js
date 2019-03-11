"use strict";

require("../webapp/use");

const Promise = require("bluebird");
const mysql = require("mysql2/promise");
const stream = require("stream");
const slog = require("single-line-log").stdout;
const printf = require("printf");
const _ = require("lodash");
const UUID = require("lib/js/tools/uuid.js");

Promise.config({
  cancellation: true
});

const ignore = new Set([
  "mnemosyne_broadcast",
  "mnemosyne_episode",
  "mnemosyne_listings_v2_noncomplied",
  "mnemosyne_pips_day",
  "mnemosyne_pips_id_map",
  "mnemosyne_pips_master_brand",
  "mnemosyne_pips_service",
  "mnemosyne_programmes_v2_noncomplied",
  "labs_uuid_map",
  "labs_uuid_xref",
]);

const createXrefTable = [
  "DROP TABLE IF EXISTS `labs_uuid_xref`",

  "CREATE TABLE `labs_uuid_xref` ("
  + "  `uuid` varchar(36) NOT NULL COMMENT 'Unique object identifier',"
  + "  `found_in` VARCHAR(80) NOT NULL COMMENT 'table.field where found',"
  + "  `count` INT(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'cardinality', "
  + "  PRIMARY KEY (`uuid`, `found_in`),"
  + "  KEY `labs_uuid_xref_uuid` (`uuid`)"
  + ") ENGINE=InnoDB DEFAULT CHARSET=utf8"
];

const createMapTable = [
  "DROP TABLE IF EXISTS `labs_uuid_map`",

  "CREATE TABLE `labs_uuid_map` AS"
  + "  SELECT `q`.*, COUNT(*) AS `count`"
  + "    FROM ("
  + "      SELECT GROUP_CONCAT(`found_in` ORDER BY `found_in`) AS `fields`"
  + "        FROM `labs_uuid_xref`"
  + "       GROUP BY `uuid`) AS `q`"
  + "  GROUP BY `fields`"
];

class XrefInserter extends stream.Writable {
  constructor(conn, opt) {
    const o = Object.assign({
      highWaterMark: 10000
    }, opt || {}, {
      objectMode: true
    });
    super(o);
    this.opt = o;
    this.conn = conn;
  }

  _writev(chunks, callback) {
    const recs = chunks.map(c => c.chunk);
    // We know this data is safe so avoid formatting / interpolation
    const sql = [
      "INSERT INTO `labs_uuid_xref` (`uuid`, `found_in`) VALUES",
      recs.map(c => `( '${c.uuid}', '${c.found_in}' )`).join(", "),
      "ON DUPLICATE KEY UPDATE `count` = `count` + 1"
    ].join(" ");

    this.conn.query(sql)
      .then(() => callback())
      .catch(callback);
  }

  _write(chunk, encoding, callback) {
    this._writev([{
      chunk,
      encoding
    }], callback);
  }

  _final(callback) {
    callback();
  }
}

class MySQLReader extends stream.Readable {
  constructor(opt, conn, ...query) {
    const o = Object.assign({
      highWaterMark: 10000
    }, opt, {
      objectMode: true
    });

    super(o);
    this.conn = conn;

    this.q = this.conn.query(...query)
      .on("error", e => this.emit("error", e))
      .on("end", () => this.push(null))
      .on("result", r => {
        if (!this.push(r))
          this.conn.pause();
      })
  }

  _read(size) {
    this.conn.resume();
  }
}

class Counter extends stream.Transform {
  constructor(every) {
    super({
      objectMode: true
    });
    this.every = every;
    this.count = 0;
  }

  _transform(chunk, encoding, callback) {
    this.count++;
    if (this.count % this.every === 0)
      this.emit("count", this.count);
    this.push(chunk);
    callback();
  }
}

async function runScript(pool, script) {
  const conn = await pool.getConnection();
  for (const sql of script) {
    console.log(">>> " + sql);
    await conn.query(sql);
  }
  pool.pool.releaseConnection(conn);
}

async function scanTable(connRead, xi, table, info) {
  const [meta] = await connRead.query("DESCRIBE `" + table + "`");
  const cols = meta.filter(r => r.Type === "varchar(36)").map(r => r.Field);

  const prefix = printf("[%-30s] ", table);

  if (cols.length === 0) {
    console.log(prefix + "has no UUID columns");
    return;
  }

  console.log(prefix + "has UUIDs in [" + cols.join(", ") + "]");

  const colsSql = cols.map(c => "`" + c + "`").join(", ");

  let doneRows = 0;

  const updateStatus = () => {
    const status = (info.count === undefined)
      ? printf("%8d/%8s (%6s%%)", doneRows, "?", "?")
      : printf("%8d/%8d (%6.2f%%)", doneRows, info.count, (doneRows * 100 / info.count));
    slog(prefix + status);
  }

  return new Promise(async (resolve, reject) => {
    const q = connRead.connection
      .query("SELECT " + colsSql + " FROM `" + table + "`")
      .on("error", reject)
      .on("end", () => {
        updateStatus();
        console.log("");
        resolve();
      })
      .on("result", r => {
        const ok = Object.entries(r)
          .map(([key, val]) => {
            return {
              uuid: val === null
                ? "(null)"
                : UUID.valid(val)
                  ? val
                  : "(invalid)",
              found_in: [table, key].join(".")
            };
          })
          .map(r => xi.write(r));

        if (ok.indexOf(false) >= 0)
          connRead.connection.pause();
        doneRows++;
        if (doneRows % 100 === 0)
          updateStatus();
      });
  });
}

async function surveyAll(pool, ti) {
  const connRead = await pool.getConnection();
  const connWrite = await pool.getConnection();

  const xi = new XrefInserter(connWrite);

  xi.on("drain", () => connRead.connection.resume());

  for (const table of ti.names) {
    const info = ti.info[table];
    await scanTable(connRead, xi, table, info);
  }

  console.log("Ending writer");
  await Promise.fromCallback(cb => xi.end(cb));

  console.log("Releasing connections");
  pool.pool.releaseConnection(connRead);
  pool.pool.releaseConnection(connWrite);

}

async function getTables(pool, ignore) {
  ignore = ignore || new Set();
  const conn = await pool.getConnection();
  const [tables] = await pool.query("SHOW TABLES");
  const tableNames = _.flatten(tables.map(r => Object.values(r)))
    .filter(n => !/^x_/.test(n))
    .filter(n => !ignore.has(n));

  let info = _.fromPairs(tableNames.map(n => [n, {}]));

  const counters = Promise.mapSeries(tableNames, async n => {
    const [res] = await pool.query("SELECT COUNT(*) AS `count` FROM `" + n + "`");
    info[n].count = res[0].count;
  }).then(() => {
    pool.pool.releaseConnection(conn);
  });

  return {
    info,
    counters,
    names: tableNames
  };
}

async function mule(pool) {
  await runScript(pool, createXrefTable);
  let ti = await getTables(pool, ignore);
  await surveyAll(pool, ti);
  await runScript(pool, createMapTable);
  ti.counters.cancel();
}

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "mnemosyne3",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

mule(pool)
  .catch(e => console.log(e))
  .finally(() => pool.end());
