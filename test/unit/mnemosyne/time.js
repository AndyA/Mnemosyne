"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const moment = require("moment");
require("lib/js/mnemosyne/time");

describe("time moment plugin", () => {
  it("should extend moment", () => {
    expect(typeof (moment.fn.dbFormat)).to.equal("function");
  });

  it("it should format db time", () => {
    const data = [
      "2010-01-01T09:30:21Z",
      "2018-07-27T23:00:00Z"
    ];
    expect(data.map(t => moment.utc(t).dbFormat())).to.deep.equal(data);
  });
});

