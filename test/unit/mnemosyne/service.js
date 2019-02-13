"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const Trove = require("lib/js/tools/trove");
const MnemosyneService = require("lib/js/mnemosyne/service");

const TestData = require("lib/js/test/data");
const td = new TestData("test/data");

describe("MnemosyneService", () => {
  const services = td.loadAllSync("service");

  const trove = new Trove(MnemosyneService.makeSet(services));

  it("should expose name, description attributes", () => {
    const r1x = trove.find("pid", "bbc_1xtra");
    expect(r1x.name)
      .to.equal("BBC Radio 1Xtra");
    expect(r1x.description)
      .to.equal("The biggest tunes, talent and mixes in new Black music");
  });

  it("should be searchable by name", () => {
    // service name is not unique - hence findAll
    expect(trove.findAll("name", "BBC Radio 1Xtra").map(s => s.pid))
      .to.deep.equal(["bbc_1xtra"]);
  });

});
