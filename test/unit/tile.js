"use strict";

var chai = require("chai");
var expect = chai.expect;

const {
  Tile,
  WildTile,
  makeTile
} = require("../../webapp/lib/js/tile.js")

describe("Tile", () => {
  const tileX = new Tile("X", 8);
  it("should have the right letter", () => {
    expect(tileX.letter)
      .to.equal("X");
  });

  it("should have the right matchLetter", () => {
    expect(tileX.matchLetter)
      .to.equal("X");
  });

  it("should have the right score", () => {
    expect(tileX.score)
      .to.equal(8);
  });
});

describe("WildTile", () => {
  it("should not have a letter", () => {
    const wildTile = new WildTile();
    expect(wildTile.letter)
      .to.be.undefined;
  });

  it("should have the right matchLetter", () => {
    const wildTile = new WildTile();
    expect(wildTile.matchLetter)
      .to.equal("*");
  });

  it("should have the right score", () => {
    const wildTile = new WildTile();
    expect(wildTile.score)
      .to.equal(0);
  });

  it("should be possible to set the letter", () => {
    const wildTile = new WildTile();
    wildTile.letter = "X";
    expect(wildTile.letter).to.equal("X");
  });

});

describe("makeTile", () => {
  it("should make a WildTile", () => {
    const t = makeTile("*");
    expect(t)
      .to.be.instanceof(WildTile);
  });

  it("should make a Tile", () => {
    const t = makeTile("Q", 10);
    expect(t)
      .to.be.instanceof(Tile);
    expect(t.matchLetter)
      .to.equal("Q");
    expect(t.score)
      .to.equal(10);
  });
});
