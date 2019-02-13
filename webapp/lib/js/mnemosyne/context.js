"use strict";

const _ = require("lodash");
const Promise = require("bluebird");
const PouchDB = require("pouchdb");

const lazyAttr = require("lib/js/tools/lazy-attr");
const Trove = require("lib/js/tools/trove");

const moment = require("moment");
require("lib/js/mnemosyne/time");

const MnemosyneBroadcast = require("lib/js/mnemosyne/broadcast");
const MnemosyneEpisode = require("lib/js/mnemosyne/episode");
const MnemosyneService = require("lib/js/mnemosyne/service");
const MnemosyneMasterBrand = require("lib/js/mnemosyne/master-brand");
const MnemosyneProgramme = require("lib/js/mnemosyne/programme");

const db = new PouchDB("http://localhost:5984/mnemosyne");

class MnemosyneContext {
  constructor() {}

  static keyTail(key) {
    return key[key.length - 1];
  }

  static makeDocument(doc) {
    switch (doc.kind) {
      case "service":
        return new MnemosyneService(doc);
      case "masterBrand":
        return new MnemosyneMasterBrand(doc);
      case "broadcast":
        return new MnemosyneBroadcast(doc);
      case "episode":
        return new MnemosyneEpisode(doc);
      default:
        throw ("Bad document kind");
    }
  }

  async loadQuery(cl, ...args) {
    let res = await db.query(...args);
    return new Trove(cl.makeSet(res.rows.map(r => r.doc)));
  }

  async loadServiceDay(service, day) {
    const me = this.constructor;
    const m = moment.utc(day);
    const start = m.startOf("day").dbFormat();
    const end = m.add(1, "day").dbFormat();

    const res = await db.query("main/broadcastsByServiceDate", {
      startkey: [service, start],
      endkey: [service, end],
      include_docs: true,
      inclusive_end: false,
      reduce: false,
      stale: "update_after"
    })

    const [services, masterBrands] = await Promise.all(
      [this.services, this.masterBrands]
    );

    let rows = res.rows.slice(0);
    let progs = [];
    while (rows.length) {
      const broadcastRow = rows.shift();

      if (me.keyTail(broadcastRow.key) !== 0)
        throw new Exception("Expected a new document group");

      let prog = {
        broadcast: me.makeDocument(broadcastRow.doc)
      };

      if (rows.length && me.keyTail(rows[0].key) === 1) {
        prog.episode = me.makeDocument(rows.shift().doc);
      }

      prog.service = services.find("_id", prog.broadcast.serviceID);
      if (prog.service.masterBrandID)
        prog.masterBrand = masterBrands.find("_id", prog.service.masterBrandID);

      progs.push(new MnemosyneProgramme(prog));
    }

    return new Trove(progs);
  }
}

lazyAttr(MnemosyneContext, "services", function() {
  return this.loadQuery(MnemosyneService, "main/services", {
    include_docs: true,
    reduce: false,
    stale: "update_after"
  });
});

lazyAttr(MnemosyneContext, "masterBrands", function() {
  return this.loadQuery(MnemosyneMasterBrand, "main/masterBrands", {
    include_docs: true,
    reduce: false,
    stale: "update_after"
  });
});

module.exports = MnemosyneContext;
