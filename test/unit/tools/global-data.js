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

  it("should handle constructor args", () => {
    const gd1 = new GlobalData();
    expect(gd1.opt).to.deep.equal({
      ttl: 60000,
      stale: true
    });

    const gd2 = new GlobalData(123);
    expect(gd2.opt).to.deep.equal({
      ttl: 123,
      stale: true
    });

    const gd3 = new GlobalData({
      stale: false
    });
    expect(gd3.opt).to.deep.equal({
      ttl: 60000,
      stale: false
    });

  });

  it("should handle add args", () => {
    const gd1 = new GlobalData({
      ttl: 1000,
      stale: false
    });

    gd1
      .add("key1", () => 1)
      .add("key2", 500, () => 2)
      .add("key3", {
        stale: true
      }, () => 3)

    let cache = _.cloneDeep(gd1.cache);
    for (var ent of Object.values(cache)) {
      delete ent.vf;
    }

    expect(cache).to.deep.equal({
      key1: {
        stale: false,
        ttl: 1000,
      },
      key2: {
        stale: false,
        ttl: 500,
      },
      key3: {
        stale: true,
        ttl: 1000,
      }
    });
    gd1.destroy();
  });
});

