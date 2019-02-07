"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const expect = chai.expect;

require("../../../webapp/use.js");

const db = require("lib/js/db");
const Trove = require("lib/js/tools/trove");
const MnemosyneContext = require("lib/js/mnemosyne/context");

after(() => {
  db.end(err => {
    if (err) console.log(err);
  });
});

describe("MnemosyneContext", () => {
  const ctx = new MnemosyneContext();

  it("should lazy load services, masterBrands", () => {
    expect(ctx.services).to.eventually.be.an.instanceof(Trove);
    expect(ctx.masterBrands).to.eventually.be.an.instanceof(Trove);
  });
});


