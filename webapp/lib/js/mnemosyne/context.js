"use strict";

const db = require("lib/js/db");
const _ = require("lodash");
const Promise = require("bluebird");
const moment = require("moment");

const lazyAttr = require("lib/js/tools/lazy-attr");
const Trove = require("lib/js/tools/trove");

const MnemosyneMapper = require("lib/js/mnemosyne/mapper");

const MnemosyneBroadcast = require("lib/js/mnemosyne/broadcast");
const MnemosyneEpisode = require("lib/js/mnemosyne/episode");
const MnemosyneService = require("lib/js/mnemosyne/service");
const MnemosyneMasterBrand = require("lib/js/mnemosyne/master-brand");
const MnemosyneProgramme = require("lib/js/mnemosyne/programme");

class MnemosyneContext {
  constructor() {
    this.mapper = new MnemosyneMapper();
  }

  async loadQuery(cl, ...args) {
    let [rows, fields] = await db.query(...args);
    return new Trove(cl.makeSet(rows));
  }

  async loadAll(cl) {
    return this.loadQuery(cl, "SELECT * FROM `" + cl.table + "`");
  }

  async makeProgrammes(broadcasts) {
    const ep = _.uniq(broadcasts.rows.map(b => b.episode));

    if (ep.length === 0)
      return new Trove([]);

    const [services, masterBrands, episodes] = await Promise.all([
      this.services,
      this.masterBrands,
      this.loadQuery(
        MnemosyneEpisode,
        "SELECT * FROM `" + MnemosyneEpisode.table + "` WHERE `uuid` IN (?)", [ep]
      )
    ]);

    return new Trove(broadcasts.rows.map(broadcast => {
      const service = services.find("uuid", broadcast.service);
      const episode = episodes.find("uuid", broadcast.episode);
      const masterBrand = service.master_brand
        ? masterBrands.find("uuid", service.master_brand)
        : null;

      return new MnemosyneProgramme({
        broadcast,
        episode,
        service,
        masterBrand
      });
    }));
  }

  async loadProgramme(ids) {
    const broadcasts = await this.loadQuery(
      MnemosyneBroadcast,
      "SELECT * FROM `" + MnemosyneBroadcast.table + "` WHERE `uuid` IN (?)",
      [ids]
    );

    return this.makeProgrammes(broadcasts);
  }

  async loadServiceDay(service, day) {
    const broadcasts = await this.loadQuery(
      MnemosyneBroadcast,
      "SELECT * FROM `" + MnemosyneBroadcast.table + "` WHERE `day` = ? AND `service_id` = ?",
      [day, service]
    );

    return this.makeProgrammes(broadcasts);
  }
}

lazyAttr(MnemosyneContext, "services", function() {
  return this.loadAll(MnemosyneService);
});

lazyAttr(MnemosyneContext, "masterBrands", function() {
  return this.loadAll(MnemosyneMasterBrand);
});

module.exports = MnemosyneContext;
