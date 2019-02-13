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

class MnemosyneContext {
  constructor() {
    this.db = new PouchDB("http://localhost:5984/mnemosyne");
  }

  static foldView(res) {
    let out = [];
    for (let row of res.rows) {
      const key = row.key;
      if (_.isArray(key)) {
        const index = key[key.length - 1];
        if (_.isNumber(index)) {
          if (index === 0) {
            row._fold = [];
            out.push(row);
          } else {
            out[out.length - 1]._fold.push(row);
          }
          continue;
        }
      }

      out.push(row);
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

  async loadQuery(...args) {
    let res = await this.db.query(...args);
    return this.makeThings(res);
  }

  async makeProgramme(row) {
    const me = this.constructor;

    if (row.doc.kind !== "broadcast")
      throw new Error("Can't make a programme from a " + row.doc.kind);

    const [services, masterBrands] = await Promise.all(
      [this.services, this.masterBrands]
    );

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

    return new MnemosyneProgramme(prog);
  }

  async makeThing(row) {
    const me = this.constructor;
    switch (row.doc.kind) {
      case "broadcast":
        return this.makeProgramme(row);
      default:
        return me.makeDocument(row.doc);
    }
  }

  async makeThings(res) {
    const me = this.constructor;
    return new Trove(await Promise.all(me.foldView(res).map(r => this.makeThing(r))));
  }

  async loadThing(id) {
    const trove = await this.loadQuery("main/pidOrID", {
      startkey: [id, 0],
      endkey: [id, 999],
      inclusive_end: false,
      reduce: false,
      include_docs: true,
      reduce: false,
      stale: "update_after"
    });
    return trove.singleton;
  }

  async loadServiceDay(service, day) {
    const m = moment.utc(day);
    const start = m.startOf("day").dbFormat();
    const end = m.add(1, "day").dbFormat();

    return this.loadQuery("main/broadcastsByServiceDate", {
      startkey: [service, start],
      endkey: [service, end],
      include_docs: true,
      inclusive_end: false,
      reduce: false,
      stale: "update_after"
    });
  }
}

lazyAttr(MnemosyneContext, "services", function() {
  return this.loadQuery("main/services", {
    include_docs: true,
    reduce: false,
    stale: "update_after"
  });
});

lazyAttr(MnemosyneContext, "masterBrands", function() {
  return this.loadQuery("main/masterBrands", {
    include_docs: true,
    reduce: false,
    stale: "update_after"
  });
});

module.exports = MnemosyneContext;
