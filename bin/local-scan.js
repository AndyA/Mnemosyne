"use strict";

const os = require("os");
const _ = require("lodash");
const Promise = require("bluebird");
const Sequelize = require("sequelize");
const lazy = require("lazy-eval").default;
const dns = Promise.promisifyAll(require('dns'));

const HOME_HOST = "pike.dyn.hexten.net";
const TABLE_SUFFIX = "aryo_activity_log";

const sequelize = new Sequelize({
  database: "activity_log_2",
  username: "root",
  password: null,
  dialect: "mysql",
  logging: false,
  operatorsAliases: false
});

const {Activity, ActivityHWM, Batch} = require("../webapp/lib/models")(sequelize);

const getHomeHost = lazy(() => {
  return dns.resolve4Async(HOME_HOST);
});

const getBatch = lazy(() => {
  return getHomeHost().then(addr => {
    return Batch.create({
      homeIp: addr[0]
    });
  });
});

survey(sequelize, TABLE_SUFFIX).then(info => {
  return Promise.map(info, spec => {
    return loadLog(sequelize, spec, os.hostname()).then(log => {
      if (!log.length)
        return null;
      return getBatch().then(batch => {
        let bulk = [];
        for (let ent of log) {
          let rec = mapAttributes(Activity, ent);
          rec.batchId = batch.id;
          bulk.push(rec);
        }
        return Activity.bulkCreate(bulk);
      });
    });
  });
}).then(() => sequelize.close());;

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

function loadLog(sequelize, spec, host) {
  return sequelize.query(
    "SELECT MAX(`histid`) AS `hwm`" +
    "  FROM `activity`" +
    " WHERE `host` = ?" +
    "   AND `database` = ?" +
    "   AND `table` = ?", {
      raw: true,
      type: Sequelize.QueryTypes.SELECT,
      replacements: [host, spec.db, spec.table]
    }).then(histid => {

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
  });
}

function survey(sequelize, table) {

  const re = new RegExp(`^(.*?)${quoteMeta(table)}$`);

  return sequelize.query("SHOW DATABASES", {
    raw: true,
    type: Sequelize.QueryTypes.SELECT
  }).then(databases => {
    return Promise.map(databases, db => {
      return sequelize.query(`SHOW TABLES FROM ${quoteIdent(db.Database)} LIKE ?`, {
        raw: true,
        type: Sequelize.QueryTypes.SELECT,
        replacements: ["%" + table]
      }).then(tables => {
        return tables.map(t => {
          const tableName = (Object.values(t))[0];
          const m = re.exec(tableName);
          if (!m)
            throw new Error(tableName + " does not match " + re);
          return {
            db: db.Database,
            table: tableName,
            prefix: m[1],
          }
        });
      });
    });
  }).then(info => {
    return _.flatten(info.filter(x => x.length));
  });
}

function quoteMeta(str) {
  return (str + '').replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1');
}

function quoteIdent(...path) {
  return path.slice(0).map(id => "`" + id + "`").join(".");
}
