"use strict";

const MW = require("mixwith");

const moment = require("moment");
const _ = require("lodash");
const Promise = require("bluebird");

const Schedule = MW.Mixin(superclass => class extends superclass {

  async loadServiceDay(service, day) {
    const m = moment.utc(day);
    const start = m.startOf("day").toStore();
    const end = m.add(1, "day").toStore();

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

    function addElipsis(days) {
      let out = [];
      for (const day of days) {
        if (out.length) {
          const prev = out[out.length - 1];
          if (moment(prev.date).add(1, "day") < day.date)
            out.push({
              today: false,
              elipsis: true
            });
        }
        out.push(day);
      }
      return out;
    }

    function centre(days) {
      const pad = Array(count).fill({
        today: false,
        missing: true
      });
      const padded = [...pad, ...days, ...pad];
      const today = _.findIndex(padded, "today");
      return padded.slice(today - count, today + count + 1);
    }

    const key = [service, ...day.split(/-/)];

    const [before, after] = await Promise.all(
      [true, false].map(descending => {
        const limit = count + (descending ? 0 : 1);

        return this.db.view("main", "serviceDates", {
          startkey: key,
          reduce: true,
          group_level: 4,
          stale: "update_after",
          limit,
          descending
        }).then(data => {
          return data.rows
            .filter(r => r.key[0] === service)
            .map(r => {
              const [service, ...dateParts] = r.key;
              const date = dateParts.join("-");
              return Object.assign({
                link: ["", "schedules", service, date].join("/"),
                service,
                date: moment.utc(date),
                today: date === day,
                missing: false
              }, r.value);
            });
        });

      }));

    return centre(addElipsis([
      ... _.reverse(before),
      ... after
    ]));
  }

}
);

module.exports = Schedule;
