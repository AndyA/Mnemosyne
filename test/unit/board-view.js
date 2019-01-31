"use strict";

var chai = require("chai");
var expect = chai.expect;

const BoardView = require("../../webapp/lib/js/board-view.js")
const Transform = require("../../webapp/lib/js/transform.js")

class TestBoard {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.access = [];
  }

  cell(x, y) {
    const pos = {
      x,
      y
    };
    this.access.push(pos);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
      return null;
    return pos;
  }
}

function testBounds(w, h, x, y, dir, want) {
  const b = new TestBoard(w, h);
  const v = new BoardView(b, new Transform(x, y, dir));
  expect(v.bounds)
    .to.deep.equal(want);
}

describe("BoardView", () => {

  describe("bounds", () => {
    it("should have the right bounds", () => {
      testBounds(15, 15, 0, 0, "across", [0, 0, 14, 14]);
      testBounds(11, 21, 3, 5, "across", [-3, -5, 7, 15]);
      testBounds(11, 21, 3, 5, "down", [-5, -3, 15, 7]);
    });
  });

});
