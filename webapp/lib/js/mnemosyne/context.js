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

  static foldView(res) {
    let out = [];
    for (let row of res.rows) {
      const key = row.key;
      const index = key[key.length - 1];
      if (index === 0) {
        row._fold = [];
        out.push(row);
      } else {
        out[out.length - 1]._fold.push(row);
      }
    }
    return out;
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

  async makeProgrammes(res) {
    const me = this.constructor;
    const [services, masterBrands] = await Promise.all(
      [this.services, this.masterBrands]
    );

    let progs = [];
    for (const row of me.foldView(res)) {
      let prog = {
        broadcast: me.makeDocument(row.doc)
      };

      const foldDocs = row._fold.map(r => me.makeDocument(r.doc));
      for (const fd of foldDocs) {
        const key = fd.constructor.key;
        if (prog.hasOwnProperty(key))
          throw new Error("Duplicate entry for " + key);
        prog[key] = fd;
      }

      prog.service = services.find("_id", prog.broadcast.serviceID);
      prog.masterBrand = masterBrands.find("_id", prog.service.masterBrandID);

      progs.push(new MnemosyneProgramme(prog));
    }

    return new Trove(progs);
  }

  async loadServiceDay(service, day) {
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

    return this.makeProgrammes(res);
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
