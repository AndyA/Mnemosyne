"use strict";

const Sequelize = require("sequelize");
const YAML = require("yamljs");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
const _ = require("lodash");

const PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-find"));

const MnemosyneHash = require("../webapp/lib/mnemosyne/hash.js");
const MnemosyneMessage = require("../webapp/lib/mnemosyne/message.js");

class Mnemosyne {
  constructor(opts) {
    this.opts = opts;
    this.init();
  }

  init() {
    // Load config
    this.config = YAML.load(this.opts.config);
    this.initSequelize();
    this.initCouch();
  }

  initSequelize() {
    const dbConfig = Object.assign({}, {
      logging: false,
      operatorsAliases: false
    }, this.config.db);

    this.sequelize = new Sequelize(dbConfig);
    this.models = require("../webapp/lib/models")(this.sequelize);
  }

  initCouch() {
    const dbConfig = this.config.couch;
    this.db = new PouchDB(dbConfig.url, dbConfig.options);
  }

  close() {
    this.sequelize.close();
  }

  async loadLog(data) {
    const stash = data.map(ent => ent.getStash());
    const indexStash = _.flatten(data.map(ent => ent.getIndexStash()));

    while (stash.length) {
      await this.models.Event.bulkCreate(stash.splice(0, 1000), {
        ignoreDuplicates: true
      });
    }

    while (indexStash.length) {
      await this.models.HashIndex.bulkCreate(indexStash.splice(0, 10000), {
        ignoreDuplicates: true
      });
    }
  }

  byKey(data, key) {
    let bk = {};
    for (const row of data) {
      const id = row[key];
      bk[id] = row;
    }
    return bk;
  }

  async addRev(data) {
    const all = await this.db.allDocs();
    const bk = this.byKey(all.rows, "id");
    for (const ent of data) {
      const old = bk[ent._id];
      if (old)
        ent._rev = old.value.rev;
    }
    return data;
  }

  async loadCouch(data) {
    const stash = await this.addRev(data.map(ent => ent.getCouchStash()));
    return this.db.bulkDocs(stash).then(resp => console.log(JSON.stringify(resp, null, 2)));
  }

  pickKeys(obj, keyMap) {
    let out = {};
    for (const key of Object.keys(keyMap)) {
      if (obj[key] !== undefined) {
        const outKey = keyMap[key];
        out[outKey] = obj[key]
      }
    }
    return out;
  }

  async siteConfig(database, table, key) {
    const res = await this.sequelize.query("SELECT * FROM `" + database + "`.`" + table + "` WHERE `option_name` = ?", {
      raw: true,
      type: Sequelize.QueryTypes.SELECT,
      replacements: [key]
    }).catch(err => {
      return "UNKNOWN";
    });

    return res[0].option_value;
  }

  async convertLog() {
    let siteCache = {};

    const activity = await this.sequelize.query("SELECT * FROM `activity`", {
      raw: true,
      type: Sequelize.QueryTypes.SELECT
    });

    let log = [];
    for (const ent of activity) {
      delete ent.user_pass;
      const m = ent.table.match(/^(.+)aryo_activity_log$/);
      if (!m)
        throw new Error("Bad table name: " + ent.table);
      const prefix = m[1];
      const siteKey = [ent.host, ent.database, ent.table].join("\t");
      const siteURL = await (siteCache[siteKey] = siteCache[siteKey] || this.siteConfig(ent.database, prefix
        + "options", "siteurl"));

      let msg = new MnemosyneMessage({
        uuid: MnemosyneHash.createUUID([ent.host, siteURL, ent.histid, ent.hist_time]),
        meta: {
          sender: "Wordpress",
          kind: "Activity Log",
          host: ent.host
        },
        timing: {
          start: new Date(ent.when),
          busy: {
            before: 10,
            after: 5
          }
        },
        identity: this.pickKeys(ent, {
          "user_id": "id",
          "user_caps": "capabilities",
          "user_login": "login",
          "user_nicename": "nicename",
          "user_email": "email",
          "user_url": "url",
          "user_registered": "registered",
          "display_name": "display",
          "host_ip": "addr"
        }),
        target: {
          site_url: siteURL
        },
        event: this.pickKeys(ent, {
          "action": "action",
          "object_type": "object_type",
          "object_subtype": "object_subtype",
          "object_name": "object_name",
          "object_id": "object_id"
        }),
        raw: ent
      });

      msg
        .addIndex("meta.sender")
        .addIndex("meta.kind")
        .addIndex("meta.host")
        .addIndex("meta.sender:meta.kind")
        .addIndex("meta.sender:meta.host")
        .addIndex("identity.email")
        .addIndex("identity.login")
        .addIndex("identity.login:target.site_url")
        .addIndex("identity.capabilities")
        .addIndex("target.site_url")
        .addIndex("event.action")
        .addIndex("event.object_type")
        .addIndex("event.object_subtype")
        .addIndex("event.object_name")
        .addIndex("event.object_type:event.object_subtype")
        .addIndex("event.object_id:target.site_url");

      log.push(msg);
    }

    return log;
  }
}

const program = require("commander");

program
  .version("0.0.1")
  .arguments('<action>')
  .option("-c, --config [config.yml]", "use alternate config", "config.yml");

program
  .command("sync")
  .description("Synchronize database")
  .action((env, options) => {
    const al = new Mnemosyne(program);
    al.sequelize.sync()
      .catch(e => console.log(e))
      .finally(() => al.close());
  });

program
  .command("load")
  .arguments('<json>')
  .description("Load JSON stash")
  .action((env, options) => {
    const al = new Mnemosyne(program);
    console.log("Loading " + env);
    fs.readFileAsync(env)
      .then(JSON.parse)
      .then(MnemosyneMessage.fromLog)
      .then(data => al.loadLog(data))
      .catch(e => console.log(e))
      .finally(() => al.close());
  });

program
  .command("convert")
  .description("Convert old activity log to events")
  .action((env, options) => {
    const al = new Mnemosyne(program);
    al.convertLog()
      .then(data => al.loadLog(data))
      .catch(e => console.log(e))
      .finally(() => al.close());
  });

program
  .command("couch")
  .description("Convert old activity log to CouchDB")
  .action((env, options) => {
    const al = new Mnemosyne(program);
    al.convertLog()
      .then(data => al.loadCouch(data))
      .catch(e => console.log(e))
      .finally(() => al.close());
  });

program.command("help").action(() => program.help());
program.on('command:*', cmd => die("Unknown command: " + cmd));

program.parse(process.argv);

function die(...args) {
  console.error(...args);
  process.exit(1);
}