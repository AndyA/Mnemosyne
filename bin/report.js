"use strict";

const os = require("os");
const Promise = require("bluebird");
const Sequelize = require("sequelize");
const lazy = require("lazy-eval").default;
const dns = Promise.promisifyAll(require("dns"));
const YAML = require("yamljs");
const moment = require("moment");
const csv = require("csv-stringify/lib/sync");
const Entities = require("html-entities").AllHtmlEntities;

const BEFORE = 5;
const AFTER = 1;

class ActivityLog {
  constructor(opts) {
    this.opts = opts;
    this.init();
  }

  init() {
    // Load config
    this.config = YAML.load(this.opts.config);

    const dbConfig = Object.assign({}, {
      logging: false,
    }, this.config.db);

    this.sequelize = new Sequelize(dbConfig);
    this.models = require("../webapp/lib/models")(this.sequelize);
  }

  close() {
    this.sequelize.close();
  }

  makeWhere(field, dbs) {
    if (dbs.includes("*"))
      return ["1 = 1", []]
    let inBind = [];
    let wildBind = [];
    for (const db of dbs) {
      const pat = db.split(/([\*\?])/);
      if (pat.length === 1) {
        inBind.push(db);
      } else {
        wildBind.push(pat.map(t => {
          switch (t) {
            case '*':
              return '%';
            case '?':
              return '_';
            default:
              return t;
          }
        }).join(""));
      }
    }
    let term = wildBind.map(() => "`" + field + "` LIKE ?");
    if (inBind.length)
      term.push("`" + field + "` IN (" + inBind.map(() => "?").join(", ") + ")");
    return [term.join(" OR "), [...wildBind, ...inBind]];
  }

  async groupConcat(model, exclude) {
    const spec = await model.describe();
    return Object.keys(spec)
      .map(field => {
        if (exclude.includes(field))
          return "`" + field + "`";
        return "GROUP_CONCAT(DISTINCT `" + field + "` SEPARATOR \", \") AS `" + field + "`"
      })
      .join(", ");
  }

  async findByDatabase(db) {
    const [where, bind] = this.makeWhere("database", db);

    const gc = await this.groupConcat(this.models.Activity, ["histid", "when"]);

    return this.sequelize.query(
      "SELECT " + gc + " FROM `activity` " +
      " WHERE " + where +
      " GROUP BY `histid`, `when` " +
      " ORDER BY `when`", {
        model: this.models.Activity,
        type: Sequelize.QueryTypes.SELECT,
        replacements: bind,
        mapToModel: true
      });
  }

  async detailByDatabase(db) {
    const [where, bind] = this.makeWhere("database", db);

    return this.sequelize.query(
      "SELECT DATE(`when`) AS `date`, TIME(MIN(`when`)) AS `start`, TIME(MAX(`when`)) AS `end`, " +
      "       `user_email`, `action`, `object_type`, `object_subtype`, `databases`, " +
      "       GROUP_CONCAT(DISTINCT `object_id` ORDER BY `object_id` SEPARATOR \", \") AS `objects`,  " +
      "       COUNT(*) AS `count`" +
      "  FROM (" +
      "    SELECT `when`, `action`, `object_type`, `object_subtype`, `object_id`, `user_email`, " +
      "           GROUP_CONCAT(DISTINCT `database` ORDER BY `database` SEPARATOR \", \") AS `databases`" +
      "      FROM `activity`" +
      "    WHERE " + where +
      "    GROUP BY `histid`, `when`" +
      "  ) AS `q`" +
      " GROUP BY `date`, `user_email`, `action`, `object_type`, `object_subtype` " +
      " ORDER BY `date`, `user_email`, `start`", {
        type: Sequelize.QueryTypes.SELECT,
        replacements: bind,
        raw: true
      });
  }

  mergeWorkRuns(log, before = 10, after = 5) {
    let users = {};

    for (let ent of log) {
      const start = new Date(ent.when.getTime() - before * 60 * 1000);
      const end = new Date(ent.when.getTime() + after * 60 * 1000);

      const email = ent.userEmail;
      let slots = users[email] = users[email] || [];

      if (slots.length) {
        let last = slots[slots.length - 1];
        if (start <= last.end) {
          last.end = end;
          last.entries.push(ent);
          continue;
        }
      }

      slots.push({
        start,
        end,
        entries: [ent]
      });
    }

    return users;
  }

  summariseRun(run) {
    let runDesc = [];
    const entities = new Entities();

    for (const ent of run.entries) {
      const desc = [
        ent.action,
        ent.objectType.toLowerCase(),
        ent.objectName,
        ent.objectSubtype,
        `(ID: ${ent.objectID})`
      ]
        .map(x => entities.decode(x))
        .filter(x => x !== undefined && x !== null && x.length)
        .join(" ");

      if (runDesc.length && runDesc[runDesc.length - 1].desc === desc)
        runDesc[runDesc.length - 1].count++;
      else
        runDesc.push({
          desc,
          count: 1
        });
    }
    return runDesc.map(ent => ent.count > 1 ? ent.desc + " x " + ent.count : ent.desc);
  }
}

const program = require("commander");

program
  .version("0.0.1")
  .arguments('<action>')
  .option("-c, --config [config.yml]", "use alternate config", "config.yml");

program
  .command("summary")
  .arguments('<database...>')
  .description("Generate summary report")
  .action((database, options) => {
    const al = new ActivityLog(program);
    al.findByDatabase(database)
      .then(log => {
        const users = al.mergeWorkRuns(log, BEFORE, AFTER);
        let rows = [];
        rows.push(["email", "database", "from", "to", "minutes", "events", "details"]);
        for (const email of Object.keys(users)) {
          for (let run of users[email]) {
            const desc = al.summariseRun(run);
            rows.push([
              email,
              run.entries[0].database,
              toSpreadsheetString(run.start),
              toSpreadsheetString(run.end),
              (moment.utc(run.end) - moment.utc(run.start)) / 60000,
              run.entries.length,
              desc.join("\n")
            ]);
          }
        }
        console.log(csv(rows));
      })
      .catch(e => console.log(e))
      .finally(() => al.close());
  });

program
  .command("detail")
  .arguments('<database...>')
  .description("Generate detail report")
  .action((database, options) => {
    const al = new ActivityLog(program);

    const cols = [
      "date", "user_email", "start", "end", "action", "object_type",
      "object_subtype", "databases", "objects", "count"
    ];

    al.detailByDatabase(database)
      .then(log => {
        let rows = [];
        rows.push(cols);
        for (const row of log)
          rows.push(cols.map(c => row[c]))
        console.log(csv(rows));
      })
      .catch(e => console.log(e))
      .finally(() => al.close());
  });

program.command("help").action(() => program.help());
program.on('command:*', cmd => die("Unknown command: " + cmd));

program.parse(process.argv);

function toSpreadsheetString(d) {
  return moment.utc(d).format("YYYY-MM-DD HH:mm:ss");
}

function die(...args) {
  console.error(...args);
  process.exit(1);
}
