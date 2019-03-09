"use strict";

const MW = require("mixwith");
const _ = require("lodash");

const nameMap = {
  broadcastDays: [
    "dev", "broadcastDays"],
  broadcastsByServiceDay: [
    "dev", "broadcastsByServiceDay"],
  broadcastsByEpisode: [
    "live", "broadcastsByEpisode"],
  broadcastsByServiceDate: [
    "live", "broadcastsByServiceDate"],
  genres: [
    "live", "genres"],
  kinds: [
    "live", "kinds"],
  pidOrID: [
    "live", "pidOrID"],
  serviceDates: [
    "live", "serviceDates"]
};

const View = MW.Mixin(superclass => class extends superclass {
  getView(name) {
    if (_.isArray(name) && name.length === 2)
      return name;

    if (nameMap[name] !== undefined)
      return nameMap[name];

    const path = name.split(/\//);
    if (path.length === 2)
      return path;

    throw new Error("Bad view name: " + name);
  }

  view(name, ...params) {
    const view = this.getView(name);
    const param = Object.assign({
      stale: "update_after"
    }, ...params);
    console.log({view, param});
    return this.db.view(...view, param);
  }
}
);

module.exports = View;


