"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const Trove = require("lib/js/tools/trove");
const MnemosyneMasterBrand = require("lib/js/mnemosyne/master-brand");

const TestData = require("lib/js/test/data");
const td = new TestData("test/data");

describe("MnemosyneMasterBrand", () => {
  const masterBrands = td.loadAllSync("master_brand");

  const trove = new Trove(MnemosyneMasterBrand.makeSet(masterBrands));

  it("should expose name, images attributes", () => {
    const r1x = trove.find("pid", "bbc_1xtra");

    expect(r1x.name)
      .to.equal("BBC Radio 1Xtra");
    expect(r1x.images)
      .to.deep.equal([
      {
        "href": "/nitro/api/images?pid=p04drxhs",
        "template_url": "ichef.bbci.co.uk/images/ic/$recipe/p04drxhs.jpg",
        "type": "standard"
      }
    ]);
  });

  it("should be searchable by name", () => {
    // master-brand name is not unique - hence findAll
    expect(trove.findAll("name", "BBC Radio 1Xtra").map(s => s.pid))
      .to.deep.equal(["bbc_1xtra"]);
  });

});
