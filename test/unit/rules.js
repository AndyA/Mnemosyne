"use strict";

const chai = require("chai");
const expect = chai.expect;

const Rules = require("../../webapp/lib/js/rules.js")
const Board = require("../../webapp/lib/js/board.js")
const {
  Tile,
  WildTile,
  makeTile
} = require("../../webapp/lib/js/tile.js");

describe("Rules", () => {

  describe("board", () => {
    const r = new Rules;
    const expectBoard = [
      "T..d...T...d..T",
      ".D...t...t...D.",
      "..D...d.d...D..",
      "d..D...d...D..d",
      "....D.....D....",
      ".t...t...t...t.",
      "..d...d.d...d..",
      "T..d...D...d..T",
      "..d...d.d...d..",
      ".t...t...t...t.",
      "....D.....D....",
      "d..D...d...D..d",
      "..D...d.d...D..",
      ".D...t...t...D.",
      "T..d...T...d..T",
    ];

    function getSpecial(sp) {
      if (!sp.length)
        return ".";
      if (sp.length === 1) {
        const spr = sp[0];
        if (spr.multiplier < 2 || spr.multiplier > 3)
          return "M";
        const letter = spr.multiplier === 2 ? "d" : "t";
        if (spr.scope === "word")
          return letter.toUpperCase();
        if (spr.scope === "letter")
          return letter.toLowerCase();
        return "S";
      }
      return "*";
    }

    function scanBoard(b) {
      var rep = [];
      b.each((cell, x, y) => {
        if (x === 0) rep.push("");
        const sp = cell.special;
        const lt = getSpecial(sp);
        rep[rep.length - 1] += lt;
      });
      return rep;
    }

    it("should have a familar board", () => {
      expect(scanBoard(r.makeBoard()))
        .to.deep.equal(expectBoard);
    });

  });

  describe("bag", () => {
    const r = new Rules;
    const bag = r.makeBag();
    it("should be the right size", () => {
      expect(bag.size)
        .to.equal(100);
    });

    it("should have two wild tiles", () => {
      const wild = bag.tiles.filter(t => t.matchLetter === "*");
      expect(wild.length)
        .to.equal(2);
      expect(wild[0])
        .to.be.an.instanceof(WildTile);
    });

    it("should have three Gs with a score of two", () => {
      const gs = bag.tiles.filter(t => t.matchLetter === "G");
      expect(gs.length)
        .to.equal(3);
      expect(gs[0].score)
        .to.equal(2);
    });
  });

  describe("eachValid", () => {
    const r = new Rules;
    const b = new Board({
      width: 5,
      height: 7
    });

    const firstMove = [
      [0, 3, "across"],
      [1, 3, "across"],
      [2, 0, "down"],
      [2, 1, "down"],
      [2, 2, "down"],
      [2, 3, "across"],
      [2, 3, "down"],
    ];

    const secondMove = [
      [0, 1, 'down'],
      [0, 2, 'across'],
      [0, 2, 'down'],
      [0, 4, 'across'],
      [0, 4, 'down'],
      [1, 1, 'down'],
      [1, 2, 'across'],
      [1, 2, 'down'],
      [1, 4, 'across'],
      [1, 4, 'down'],
      [2, 1, 'down'],
      [2, 2, 'across'],
      [2, 2, 'down'],
      [2, 4, 'across'],
      [2, 4, 'down'],
      [3, 2, 'down'],
      [3, 3, 'across'],
      [3, 3, 'down']
    ];

    function sortMoves(moves) {
      return moves.slice()
        .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2].localeCompare(
          b[2]));
    }

    function catchValid(len) {
      let log = [];
      r.eachValid(b, 2, (x, y, dir) => log.push([x, y, dir]));
      return sortMoves(log);
    }

    it("should return the correct opening moves", () => {
      expect(catchValid())
        .to.deep.equal(firstMove);
    });

    it("should return the correct second move", () => {
      b.cell(0, 3)
        .tile = makeTile("T");
      b.cell(1, 3)
        .tile = makeTile("H");
      b.cell(2, 3)
        .tile = makeTile("E");

      const nextMove = catchValid(2);

      expect(sortMoves(nextMove))
        .to.deep.equal(sortMoves(secondMove));
    });
  });

});
