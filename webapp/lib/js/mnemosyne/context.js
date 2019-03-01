"use strict";

const MW = require("mixwith");

const _ = require("lodash");
const Promise = require("bluebird");
const nano = require("nano");

const lazyAttr = require("lib/js/tools/lazy-attr");
const Trove = require("lib/js/tools/trove");

const config = require("config");
require("lib/js/mnemosyne/time");

const MnemosyneBase = require("lib/js/mnemosyne/base");
const MnemosyneBroadcast = require("lib/js/mnemosyne/broadcast");
const MnemosyneEpisode = require("lib/js/mnemosyne/episode");
const MnemosyneService = require("lib/js/mnemosyne/service");
const MnemosyneMasterBrand = require("lib/js/mnemosyne/master-brand");
const MnemosyneProgramme = require("lib/js/mnemosyne/programme");
const GlobalData = require("lib/js/tools/global-data");

const foldAttr = "_fold";

class MnemosyneContext extends MW.mix(MnemosyneBase).with(
    require("lib/js/mnemosyne/mixin/schedule")
  ) {
  constructor() {
    super();
    this.db = nano(Object.assign({}, config.get("db")));

    this.gd = new GlobalData(10 * 60 * 1000) // 10m timeout
      .add("services", key => this.loadServices())
      .add("masterBrands", key => this.loadAll("masterBrand"))
      .on("evict", key => console.log("Evicted " + key))
      .on("refresh", (key, v) => console.log("Refreshed " + key));
  }

  destroy() {
    this.gd.destroy();
  }

  // By convention if a view has a compound key with a numeric
  // element last we treat the last element of the key as an
  // index. Index 0 is the main thing; higher indexes are folded
  // into the parent in an attribute called _fold (defined as 
  // foldAttr above).
  static foldView(res) {
    let out = [];
    for (let row of res.rows) {
      const key = row.key;
      if (_.isArray(key)) {
        const index = key[key.length - 1];
        if (_.isNumber(index)) {
          if (index === 0) {
            row[foldAttr] = [];
            out.push(row);
          } else {
            out[out.length - 1][foldAttr].push(row);
          }
          continue;
        }
      }

      out.push(row);
    }
    return out;
  }

  static documentClass(doc) {
    switch (doc.kind) {
      case "service":
        return MnemosyneService;
      case "masterBrand":
        return MnemosyneMasterBrand;
      case "broadcast":
        return MnemosyneBroadcast;
      case "episode":
        return MnemosyneEpisode;
      default:
        return null;
    }
  }

  static makeDocument(doc) {
    const cl = this.documentClass(doc);
    if (null === cl)
      throw ("Bad document kind");
    return new cl(doc);
  }

  get services() {
    return this.gd.get("services");
  }

  get masterBrands() {
    return this.gd.get("masterBrands");
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

    const foldDocs = (row[foldAttr] || []).map(r => me.makeDocument(r.doc));
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

  async loadView(...args) {
    let res = await this.db.view(...args);
    return this.makeThings(res);
  }

  async loadThing(id) {
    const trove = await this.loadView("main", "pidOrID", {
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

  async loadAll(kind) {
    return this.loadView("main", "kinds", {
      key: kind,
      include_docs: true,
      reduce: false,
      stale: "update_after"
    });
  }

  // Services involve a second query to get the serviceDays
  async loadServices() {
    let [services, serviceDates] = await Promise.all([
      this.loadAll("service"),
      this.db.view("main", "serviceDates", {
        reduce: true,
        group_level: 1,
        stale: "update_after"
      })
    ]);

    for (const sd of serviceDates.rows) {
      let svc = services.find("pid", sd.key);
      svc.service.history = sd.value;
    }

    return services;
  }

}

module.exports = MnemosyneContext;
