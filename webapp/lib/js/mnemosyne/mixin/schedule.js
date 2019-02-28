"use strict";

const MW = require("mixwith");

const moment = require("moment");
const _ = require("lodash");
const Promise = require("bluebird");

const Schedule = MW.Mixin(superclass => class extends superclass {

  async loadServiceDay(service, day) {
    const m = moment.utc(day);
    const start = m.startOf("day").dbFormat();
    const end = m.add(1, "day").dbFormat();

    return this.loadView("main", "broadcastsByServiceDate", {
      startkey: [service, start],
      endkey: [service, end],
      include_docs: true,
      inclusive_end: false,
      reduce: false,
      stale: "update_after"
    });
  }

  // Load days around the specified day
  async loadDaysAround(service, day, count) {
    let key = day.split(/-/);
    key.unshift(service);

    const [before, after] = await Promise.all(
      [true, false].map(descending => this.db.view("main", "serviceDates", {
        startkey: key,
        reduce: true,
        group_level: 4,
        stale: "update_after",
        limit: count + (descending ? 0 : 1),
        descending
      })));

    return [
      ... _.reverse(before.rows),
      ... after.rows
    ].map(r => {
      const [service, ...dateParts] = r.key;
      const date = dateParts.join("-");
      return Object.assign({
        link: ["", "schedules", service, date].join("/"),
        service,
        date,
        today: date === day
      }, r.value);
    }).filter(r => r.service === service);
  }

});

module.exports = Schedule;
