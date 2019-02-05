"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const Trove = require("lib/js/mnemosyne/trove");
const MnemosyneService = require("lib/js/mnemosyne/service");

const TestData = require("lib/js/test/data");
const td = new TestData("test/data");

describe("MnemosyneService", () => {
  const services = td.loadAllSync("service");

  const trove = new Trove(services.map(s => new MnemosyneService(s)));

  it("should expose name attribute", () => {
    const r1x = trove.find("ID", "bbc_1xtra");
    expect(r1x.name).to.equal("BBC Radio 1Xtra");
  });

  it("should be searchable by name", () => {
    // service name is not unique - hence findAll
    expect(trove.findAll("name", "BBC Radio 1Xtra").map(s => s.ID))
      .to.deep.equal(["bbc_1xtra"]);
  });

});
