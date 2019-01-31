"use strict";

const chai = require("chai");
const expect = chai.expect;

const math = require("mathjs");

const Bag = require("../../webapp/lib/js/bag.js");

const {
  Tile,
  WildTile
} = require("../../webapp/lib/js/tile.js");

const tiles = {
  A: {
    score: 1,
    count: 9
  },
  B: {
    score: 3,
    count: 2
  },
  C: {
    score: 3,
    count: 2
  },
  D: {
    score: 2,
    count: 4
  },
  E: {
    score: 1,
    count: 12
  },
  F: {
    score: 4,
    count: 2
  },
  G: {
    score: 2,
    count: 3
  },
  H: {
    score: 4,
    count: 2
  },
  I: {
    score: 1,
    count: 9
  },
  J: {
    score: 8,
    count: 1
  },
  K: {
    score: 5,
    count: 1
  },
  L: {
    score: 1,
    count: 4
  },
  M: {
    score: 3,
    count: 2
  },
  N: {
    score: 1,
    count: 6
  },
  O: {
    score: 1,
    count: 8
  },
  P: {
    score: 3,
    count: 2
  },
  Q: {
    score: 10,
    count: 1
  },
  R: {
    score: 1,
    count: 6
  },
  S: {
    score: 1,
    count: 4
  },
  T: {
    score: 1,
    count: 6
  },
  U: {
    score: 1,
    count: 4
  },
  V: {
    score: 4,
    count: 2
  },
  W: {
    score: 4,
    count: 2
  },
  X: {
    score: 8,
    count: 1
  },
  Y: {
    score: 4,
    count: 2
  },
  Z: {
    score: 10,
    count: 1
  },
  "*": {
    count: 2
  },
};

function makeBag(tiles) {
  let pile = [];
  for (let [lt, spec] of Object.entries(tiles)) {
    for (let i = 0; i < spec.count; i++) {
      const tile = lt === "*" ? new WildTile() : new Tile(lt, spec.score);
      pile.push(tile);
    }
  }
  return new Bag(pile);
}

describe("Bag", () => {
  describe("size", () => {
    let bag = makeBag(tiles);

    it("should contain the right number of tiles", () => {
      expect(bag.size)
        .to.equal(100);
    });

  });

  describe("pull", () => {
    let bag = makeBag(tiles);
    const pick = [10, 3, 20, 11];
    const want = pick.map(i => bag.tiles[i]);
    const got = bag.pull(pick);

    it("should be possible to pull tiles", () => {
      expect(got)
        .to.deep.equal(want);
    });

    it("should remove tiles from the bag", () => {
      expect(bag.size)
        .to.equal(100 - pick.length);
    });
  });

  describe("take", () => {
    let bag = makeBag(tiles);
    const bagSize = bag.size;

    // Mark the bag
    for (let i in bag.tiles)
      bag.tiles[i]._index = i;

    const got = bag.take(20);
    const gotIndex = got.map(x => x._index);

    it("should be a random selection", () => {
      const m = math.mean(gotIndex);
      const s = math.std(gotIndex);
      expect(s)
        .to.be.above(15);
      expect(m)
        .to.be.above(bagSize / 4);
      expect(m)
        .to.be.below(bagSize * 3 / 4);

    });
    it("should remove tiles from the bag", () => {
      expect(bag.size)
        .to.equal(100 - got.length);
    });
  });
});
