"use strict";


const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const GlobalData = require("lib/js/tools/global-data");
const Promise = require("bluebird");
const _ = require("lodash");

async function testGlobalDate(gd) {
  let log = [];
  let varNames = [];

  const start = new Date();
  let last = 0;

  function record(msg) {
    const ts = new Date() - start;
    const rec = {
      ts,
      rel: ts - last,
      msg
    };
    last = ts;
    //    console.log(JSON.stringify(rec));
    log.push(rec);
  }

  function addKey(name, ttl, delay, seq) {
    gd.add(name, ttl, function(key) {
      record(["compute", key, seq]);
      return Promise.delay(delay).then(() => {
        seq++;
        record(["computed", key, seq]);
        return seq;
      });
    });
    varNames.push(name);
  }

  //  gd.on("evict", obj => record(["evict", obj]));

  addKey("val1", 80, 50, 1000);
  addKey("val2", 10, 100, 2000);

  for (let i = 0; i < 25; i++) {
    record(["get", i]);
    const vals = await Promise.all(varNames.map(n => gd.get(n)));
    const valObj = _.zipObject(varNames, vals);
    record(["got", i, valObj]);
    await Promise.delay(11);
  }

  return log;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function checkLog(log) {
  let curValue = {};
  let err = [];
  let getTimes = [];

  for (const {ts, msg} of log) {
    const [verb, key, arg] = [...msg];
    switch (verb) {
      case 'get':
        getTimes[key] = {
          start: ts
        };
        break;
      case 'got':
        getTimes[key].end = ts;
        if (!deepEqual(arg, curValue))
          err.push({
            msg: "Got wrong value",
            arg,
            curValue
          });
        break;
      case 'compute':
        break;
      case 'computed':
        curValue[key] = arg;
        break;
      default:
        throw new Error("Bad verb: " + verb);
    }
  }

  let gotTimes = getTimes.map(t => t.end - t.start);
  const gotFirst = gotTimes.shift();
  const slowTimes = gotTimes.filter(t => t > 5);

  if (gotFirst < 50)
    err.push({
      msg: "First get too fast",
      gotFirst
    });

  if (slowTimes.length)
    err.push({
      msg: "Slow gets",
      slowTimes
    });

  return err;
}

let gd = new GlobalData();

after(() => gd.destroy());

describe("GlobalData", () => {
  it("should return correct (if stale) data", async () => {
    const log = await testGlobalDate(gd);
    const err = checkLog(log);
    expect(err).to.deep.equal([]);
  });
});
