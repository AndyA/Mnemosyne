"use strict";

const os = require("os");
const Promise = require("bluebird");
const Sequelize = require("sequelize");
const lazy = require("lazy-eval").default;
const dns = Promise.promisifyAll(require("dns"));
const YAML = require("yamljs");
const moment = require("moment");

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
      operatorsAliases: false
    }, this.config.db);

    this.sequelize = new Sequelize(dbConfig);
    this.models = require("../webapp/lib/models")(this.sequelize);
  }

  close() {
    this.sequelize.close();
  }

  makeWhere(field, dbs) {
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
        const users = al.mergeWorkRuns(log, 15, 15);
        console.log(["email", "database", "from", "to", "events"].join("\t"));
        for (const email of Object.keys(users)) {
          for (let run of users[email]) {
            console.log([
              email,
              run.entries[0].database,
              toSpreadsheetString(run.start),
              toSpreadsheetString(run.end),
              run.entries.length
            ].join("\t"));
          }
        }
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
        console.log(cols.join("\t"));
        for (const row of log)
          console.log(cols.map(c => row[c]).join("\t"));
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
