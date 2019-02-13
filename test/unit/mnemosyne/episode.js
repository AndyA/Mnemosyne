"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const Trove = require("lib/js/tools/trove");
const MnemosyneEpisode = require("lib/js/mnemosyne/episode");

const TestData = require("lib/js/test/data");
const td = new TestData("test/data");

describe("MnemosyneEpisode", () => {
  const episodes = td.loadAllSync("episode");

  const trove = new Trove(MnemosyneEpisode.makeSet(episodes));

  it("should have some attributes", () => {
    const ep = trove.find("pid", "b008gdwj");
    expect(ep.link)
    .to.equal("/b008gdwj");
    expect(ep.title)
      .to.equal("A Vision of the World");
    expect(ep.containersTitle)
      .to.equal("Edwardians in Colour: The Wonderful World of Albert Kahn: Reversioned Series");
    expect(ep.synopsis.short)
      .to.equal("This episode documents Albert Kahn\'s first voyage.");
    expect(ep.shortSynopsis)
      .to.equal("This episode documents Albert Kahn\'s first voyage.");
    expect(ep.presentationTitle)
    .to.equal("Episode 1");
  });

});
