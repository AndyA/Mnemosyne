"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const moment = require("moment");
require("lib/js/mnemosyne/time");

describe("time moment plugin", () => {
  it("should extend moment", () => {
    expect(typeof (moment.fn.toStore)).to.equal("function");
    expect(typeof (moment.fromStore)).to.equal("function");
  });

  const data = [
    "1923-06-11T11:35:32Z",
    "2010-01-01T09:30:21Z",
    "2018-07-27T23:00:00Z"
  ];

  it("it should format store time", () => {
    expect(data.map(t => moment.utc(t).toStore())).to.deep.equal(data);
  });

  it("it should parse store time", () => {
    expect(data.map(t => moment.fromStore(t).toStore())).to.deep.equal(data);
  });

  it("it should reject badly formatted time", () => {
    expect(() => {
      moment.fromStore("1971-01-23 11:30:00")
    }).to.throw(/invalid/i);
  });
});

