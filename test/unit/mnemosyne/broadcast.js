"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const Trove = require("lib/js/tools/trove");
const MnemosyneBroadcast = require("lib/js/mnemosyne/broadcast");

const TestData = require("lib/js/test/data");
const td = new TestData("test/data");

describe("MnemosyneBroadcast", () => {
  const broadcasts = td.loadAllSync("broadcast");

  const trove = new Trove(MnemosyneBroadcast.makeSet(broadcasts));

  it("should have some attributes", () => {
    const bc = trove.find("ID", "p006f1hm");
    expect(bc.txTime.format("YYYY-MM-DD HH:mm:ss"))
    .to.equal("2010-02-20 01:15:00");
  });

});

