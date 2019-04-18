"use strict";

const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const csv = require("csv-stringify/lib/sync");
const moment = require("moment");
const mkdirp = require("mkdirp");

const skype = fs.readFileSync("ref/skype.json");
const hist = JSON.parse(skype);
const outdir = "skype";

mkdirp.sync(outdir);

let global = makeTable();
for (const c of hist.conversations) {
  if (!c.MessageList.length)
    continue;

  let report = makeTable();

  const ml = c.MessageList.slice(0);
  _.reverse(ml);

  const id = parseId(c.id);
  const conversationName = c.displayName || id.name;

  // First message
  const from = moment.utc(ml[0].originalarrivaltime);
  const to = moment.utc(ml[ml.length - 1].originalarrivaltime);
  const reportName = path.join(outdir,
    safeName(conversationName) + " " +
    from.format("YYYY.MM.DD") + " - " + to.format("YYYY.MM.DD") +
    ".csv"
  );

  for (const m of ml) {
    const from = parseId(m.from);
    const ts = moment.utc(m.originalarrivaltime);
    const row = [
      ts.format("YYYY/MM/DD"),
      ts.format("HH:mm:ss"),
      conversationName,
      from.name,
      m.messagetype,
      m.content
    ];
    global.push(row);
    report.push(row);
  }
  saveCSV(reportName, report);
}

saveCSV(path.join(outdir, "global.csv"), global);

function safeName(name) {
  return name.replace(/[\s:]+/g, " ")
    .replace(/[^\w\s]+/g, "");
}

function saveCSV(name, rows) {
  console.log("Writing " + name + " (" + rows.length + " rows)");
  fs.writeFileSync(name, csv(rows));
}

function makeTable() {
  return [
    ["date", "time", "conversation", "from", "type", "content"]
  ];
}

function parseId(id) {
  const [code, name] = id.split(/:/, 2);
  return {
    code,
    name
  };
}
