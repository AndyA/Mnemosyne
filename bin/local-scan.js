"use strict";

const os = require("os");
const Promise = require("bluebird");
const Sequelize = require("sequelize");
const lazy = require("lazy-eval").default;
const dns = Promise.promisifyAll(require('dns'));
const YAML = require('yamljs');

const CONFIG_FILE = "config.yml";

const config = YAML.load(CONFIG_FILE);

const dbConfig = Object.assign({}, {
  logging: false,
}, config.db);

const sequelize = new Sequelize(dbConfig);

const {Activity, Batch} = require("../webapp/lib/models")(sequelize);

const getHomeHost = lazy(() => {
  return dns.resolve4Async(config.app.home_host);
});

const getBatch = lazy(() => {
  return getHomeHost().then(addr => {
    return Batch.create({
      homeAddr: addr[0]
    });
  });
});

loadLatest(sequelize, config.app.table_suffix)
  .then(() => sequelize.close())
  .catch(e => console.log(e));

async function loadLatest(sequelize, table) {
  const info = await survey(sequelize, table);

  let bulk = [];

  for (let spec of info) {
    const log = await loadLog(sequelize, spec, os.hostname());
    if (!log.length) continue;

    const batch = await getBatch();

    for (let ent of log) {
      let rec = mapAttributes(Activity, ent);
      rec.batchID = batch.id;
      bulk.push(rec);
    }
  }

  if (bulk.length)
    await Activity.bulkCreate(bulk);
}

function mapAttributes(model, rec) {
  const attrs = model.rawAttributes;
  let out = {};
  for (let attr of Object.keys(attrs)) {
    const info = attrs[attr];
    const field = info.field || attr;
    if (rec.hasOwnProperty(field))
      out[attr] = rec[field];
  }
  return out;
}

async function loadLog(sequelize, spec, host) {
  const histid = await sequelize.query(
    "SELECT MAX(`histid`) AS `hwm`" +
    "  FROM `activity`" +
    " WHERE `host` = ?" +
    "   AND `database` = ?" +
    "   AND `table` = ?", {
      raw: true,
      type: Sequelize.QueryTypes.SELECT,
      replacements: [host, spec.db, spec.table]
    });

  let term = [quoteIdent("aal", "user_id") + " = " + quoteIdent("u", "ID")];
  let bind = [host, spec.db, spec.table];

  if (histid[0].hwm !== null) {
    term.push(quoteIdent("aal", "histid") + " > ?");
    bind.push(histid[0].hwm);
  }

  return sequelize.query(
    "SELECT ? AS `host`, ? AS `database`, ? AS `table`, " +
    "       FROM_UNIXTIME(`aal`.`hist_time`) AS `when`, " +
    "       `aal`.*, `u`.* " +
    "  FROM " + quoteIdent(spec.db, spec.table) + " AS `aal`, " +
    "       " + quoteIdent(spec.db, spec.prefix + "users") + " AS `u`" +
    " WHERE " + term.join(" AND "), {
      type: Sequelize.QueryTypes.SELECT,
      replacements: bind
    });
}

async function survey(sequelize, table) {

  const re = new RegExp(`^(.*?)${quoteMeta(table)}$`);

  const databases = await sequelize.query("SHOW DATABASES", {
    raw: true,
    type: Sequelize.QueryTypes.SELECT
  });

  let info = [];

  for (let db of databases) {
    const tables = await sequelize.query(`SHOW TABLES FROM ${quoteIdent(db.Database)} LIKE ?`, {
      raw: true,
      type: Sequelize.QueryTypes.SELECT,
      replacements: ["%" + table]
    });

    for (let t of tables) {
      const tableName = (Object.values(t))[0];

      const m = re.exec(tableName);
      if (!m)
        throw new Error(tableName + " does not match " + re);

      info.push({
        db: db.Database,
        table: tableName,
        prefix: m[1],
      });
    }
  }

  return info;
}

function quoteMeta(str) {
  return (str + '').replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1');
}

function quoteIdent(...path) {
  return path.slice(0).map(id => "`" + id + "`").join(".");
}
