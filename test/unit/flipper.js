"use strict";

const chai = require("chai");
const expect = chai.expect;

const Flipper = require("../../webapp/lib/js/flipper.js")

const width = 15;
const height = 15;

const testCase = [{
    name: "central",
    args: [7, 7],
    want: [
      [7, 7]
    ]
  },
  {
    name: "corner",
    args: [0, 0],
    want: [
      [0, 0],
      [0, 14],
      [14, 0],
      [14, 14]
    ]
  },
  {
    name: "random",
    args: [3, 2],
    want: [
      [3, 2],
      [3, 12],
      [11, 2],
      [11, 12],
      [2, 3],
      [2, 11],
      [12, 3],
      [12, 11]
    ]
  },
];

describe("Flipper", () => {

  const flipper = new Flipper([
    (x, y) => [y, x],
    (x, y) => [width - 1 - x, y],
    (x, y) => [x, height - 1 - y]
  ]);

  for (const tc of testCase) {
    it("should handle: " + tc.name, () => {
      var got = [];
      flipper.flip(tc.args, (...args) => {
        got.push(args)
      });
      expect(got)
        .to.deep.equal(tc.want);
    });
  }


});
