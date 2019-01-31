"use strict";

var chai = require("chai");
var expect = chai.expect;

const Board = require("../../webapp/lib/js/board.js");
const {
  Tile,
  WildTile
} = require("../../webapp/lib/js/tile.js");

describe("Board", () => {
  describe("Empty board", () => {
    let board = new Board();

    it("should have the correct size", () => {
      expect(board.width)
        .to.equal(15);
      expect(board.height)
        .to.equal(15);
    });

    it("should know it is empty", () => {
      expect(board.used)
        .to.equal(0);
      expect(board.free)
        .to.equal(15 * 15);
    });
  });

  describe("Non-empty board", () => {
    let board = new Board();

    board.cell(0, 0)
      .tile = new Tile("X", 8);

    board.cell(14, 14)
      .tile = new Tile("A", 1);

    board.cell(7, 7)
      .tile = new WildTile();

    it("should know it is empty", () => {
      expect(board.used)
        .to.equal(3);
      expect(board.free)
        .to.equal(15 * 15 - 3);
    });
  });
});
