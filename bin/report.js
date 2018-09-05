"use strict";

const os = require("os");
const Promise = require("bluebird");
const Sequelize = require("sequelize");
const lazy = require("lazy-eval").default;
const dns = Promise.promisifyAll(require("dns"));
const YAML = require("yamljs");

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

  async findByDatabase(db) {
    return this.models.Activity.findAll({
      where: {
        database: db
      },
      order: ["when"]
    });
  }

  mergeWorkRuns(log, before = 10, after = 5) {
    let slots = [];

    for (let ent of log) {
      const start = new Date(ent.when.getTime() - before * 60 * 1000);
      const end = new Date(ent.when.getTime() + after * 60 * 1000);

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

    return slots;
  }
}

const program = require("commander");

program
  .version("0.0.1")
  .arguments('<action>')
  .option("-c, --config [config.yml]", "use alternate config", "config.yml");

program
  .command("summary")
  .arguments('<client>')
  .description("Generate summary report")
  .action((env, options) => {
    const al = new ActivityLog(program);
    al.findByDatabase(env)
      .then(log => {
        const runs = al.mergeWorkRuns(log, 15, 15);
        console.log(["from", "to", "events"].join("\t"));
        for (let run of runs) {
          console.log([
            run.start.toISOString(),
            run.end.toISOString(),
            run.entries.length
          ].join("\t"));
        }
      })
      .then(() => al.close());
  });

program.command("help").action(() => program.help());
program.on('command:*', cmd => die("Unknown command: " + cmd));

program.parse(process.argv);

function die(...args) {
  console.error(...args);
  process.exit(1);
}
