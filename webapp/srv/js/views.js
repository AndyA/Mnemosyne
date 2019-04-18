"use strict";

const express = require("express");

const UUID = require("lib/js/tools/uuid");
const MnemosyneContext = require("lib/js/mnemosyne/context");
const Promise = require("bluebird");
const moment = require("moment");

const app = express();
const ctx = new MnemosyneContext();

function makeTitle(...parts) {
  return [...parts, "BBC Mnemosyne"].join(" | ");
}

function notFound(res) {
  return res.status(404).render("404", {
    title: makeTitle("Not found")
  });
}

function getStash(obj) {
  return Promise.props(Object.assign({}, obj, {
    services: ctx.services,
    masterBrands: ctx.masterBrands
  }));
}

app.get("/", (req, res) => {
  res.render("home", {
    title: makeTitle(),
  });
});

app.get("/schedules/:service/:day", async (req, res) => {
  const stash = await getStash({
    progs: ctx.loadServiceDay(req.params.service, req.params.day),
    around: ctx.loadDaysAround(req.params.service, req.params.day, 6),
  });

  const service = stash.services.find("pid", req.params.service);
  const date = moment.utc(req.params.day);

  res.render("schedules", Object.assign(stash, {
    title: makeTitle(service.name, req.params.day),
    service,
    date
  }));
});

class ThingExtra {

  static programme(stash) {
    return {
      broadcasts: ctx.loadAllBroadcasts(stash.thing)
    };
  }

  // Load any extra data a particular kind of thing needs.
  static load(key, stash) {
    if (this[key])
      return Promise.props(this[key](stash));
    return {};
  }
}

app.get("/:thing", async (req, res, next) => {
  const id = UUID.toHash(req.params.thing.toLowerCase());

  // Guard against, e.g. favicon.ico
  if (/\W/.test(id))
    return next("route");

  const stash = await getStash({
    thing: ctx.loadThing(id)
  });

  if (!stash.thing)
    return notFound(res);

  const key = stash.thing.constructor.key;
  const extra = await ThingExtra.load(key, stash);

  res.render("thing/" + key, Object.assign(stash, extra, {
    title: makeTitle(stash.thing.title),
    key
  }));
});

module.exports = app;
