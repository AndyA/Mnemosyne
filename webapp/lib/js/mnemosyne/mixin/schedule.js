"use strict";

const MW = require("mixwith");

const moment = require("lib/js/bbc/datetime");
const _ = require("lodash");
const Promise = require("bluebird");

const Schedule = MW.Mixin(superclass => class extends superclass {

  async loadServiceDay(service, day) {
    const start = moment.radioTimes(day).startOf("day");
    const end = moment(start).add(1, "day");

    return this.loadView("broadcastsByServiceDay", {
      startkey: [service, start.format("YYYY-MM-DD")],
      endkey: [service, end.format("YYYY-MM-DD")],
      inclusive_end: false,
      reduce: false,
      include_docs: true
    })
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
        return this.view("broadcastDays", {
          startkey: key,
          reduce: true,
          group_level: 4,
          limit: count + 1,
          descending
        }).then(data => {
          // Drop duplicate
          if (descending)
            data.rows.shift();
          return data.rows
            .filter(r => r.key[0] === service)
            .map(r => {
              const [service, ...dateParts] = r.key;
              const date = dateParts.join("-");
              return Object.assign({
                link: ["", "schedules", service, date].join("/"),
                service,
                date: moment.radioTimes(date),
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
