"use strict";

const Sequelize = require("sequelize");
const YAML = require("yamljs");
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
const _ = require("lodash");

const MnemosyneMessage = require("../webapp/lib/mnemosyne/message.js");

class Mnemosyne {
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
    fs.readFileAsync(env).then(JSON.parse).then(MnemosyneMessage.fromLog).then(data => {
      const stash = data.map(ent => ent.getStash());
      const indexStash = _.flatten(data.map(ent => ent.getIndexStash()));
      return al.models.Event.bulkCreate(stash, {
        ignoreDuplicates: true
      }).then(() => {
        return al.models.HashIndex.bulkCreate(indexStash, {
          ignoreDuplicates: true
        });
      });
    }).catch(e => console.log(e))
      .finally(() => al.close());
  });

program.command("help").action(() => program.help());
program.on('command:*', cmd => die("Unknown command: " + cmd));

program.parse(process.argv);

function die(...args) {
  console.error(...args);
  process.exit(1);
}
