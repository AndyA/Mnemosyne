"use strict";

const chai = require("chai");
const expect = chai.expect;

const MnemosyneTiming = require("../../../webapp/lib/mnemosyne/timing.js");

describe("MnemosyneTiming", () => {
  const testCase = [
    {
      timing: {
        busy: {
          after: 5,
          before: 10
        },
        start: "2018-09-05T14:38:05+00:00"
      },
      expect: {
        start: "2018-09-05T14:38:05.000Z",
        end: "2018-09-05T14:38:05.000Z",
        duration: 0,
        busyBefore: 10,
        busyAfter: 5,
        busyStart: "2018-09-05T14:28:05.000Z",
        busyEnd: "2018-09-05T14:43:05.000Z",
        busyDuration: 15 * 60 * 1000,
      }
    },
    {
      timing: {
        start: "2018-09-05T14:38:05+00:00"
      },
      expect: {
        start: "2018-09-05T14:38:05.000Z",
        end: "2018-09-05T14:38:05.000Z",
        duration: 0,
        busyBefore: 0,
        busyAfter: 0,
        busyStart: "2018-09-05T14:38:05.000Z",
        busyEnd: "2018-09-05T14:38:05.000Z",
        busyDuration: 0,
      }
    },
    {
      timing: {
        start: "2018-09-05T14:38:05+00:00",
        end: "2018-09-05T14:48:00+00:00"
      },
      expect: {
        start: "2018-09-05T14:38:05.000Z",
        end: "2018-09-05T14:48:00.000Z",
        duration: (10 * 60 - 5) * 1000,
        busyBefore: 0,
        busyAfter: 0,
        busyStart: "2018-09-05T14:38:05.000Z",
        busyEnd: "2018-09-05T14:48:00.000Z",
        busyDuration: (10 * 60 - 5) * 1000,
      }
    },
  ];

  for (const tc of testCase) {
    const t = new MnemosyneTiming(tc.timing);
    let got = {};
    for (let field of Object.keys(tc.expect)) {
      const v = t[field];
      got[field] = v instanceof Date ? v.toISOString() : v;
    }
    it("should have the expected values", () => {
      expect(got).to.deep.equal(tc.expect);
    });
  }

});
