"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const UUID = require("lib/js/tools/uuid.js");
const UUIDMaker = require("lib/js/tools/uuidmaker.js");

describe("UUIDMaker", () => {
  const td = [
    ["bbc_cantonese_radio", "59bfffba-561c-700a-7d91-566140612590"],
    ["bbc_parliament", "3ad032b6-1498-3bf5-6b96-1fc10262339b"],
    ["bbc_radio_bristol", "3cbad5c4-8370-8a71-d0cc-40e55f5feb34"],
    ["bbc_radio_cymru_mwy", "8b8e7173-acdd-295b-e1b2-954479c47043"],
    ["bbc_radio_shropshire", "c86bfada-97f1-d532-fed3-85481ba59a1c"],
  ];

  it("should create correct UUIDs", () => {
    const m = new UUIDMaker("mnemosyne_pips_master_brand");
    for (const tc of td) {
      const [info, uuid] = tc;
      expect(m.make(info)).to.equal(uuid);

      const u = m.uuid(info);
      expect(u.hash).to.equal(UUID.hash(uuid));
      expect(u.uuid).to.equal(uuid);
    }
  });

  it("should handle a namespace prefix", () => {
    expect(UUID.make("PIPS", "Foo")).to.equal("8f22139a-0d00-aac9-0679-51acd64cf43d");
    expect(UUID.make("PIPS", "MasterBrand", "Foo")).to.equal("124fb759-79a6-1c1d-61b5-64687b6ccf0e");
  });

  it("should handle multiple prefixes", () => {
    const m1 = new UUIDMaker("PIPS");
    expect(m1.make("Foo")).to.equal("8f22139a-0d00-aac9-0679-51acd64cf43d");
    expect(m1.make("MasterBrand", "Foo")).to.equal("124fb759-79a6-1c1d-61b5-64687b6ccf0e");
    const m2 = new UUIDMaker("PIPS", "MasterBrand");
    expect(m2.make("Foo")).to.equal("124fb759-79a6-1c1d-61b5-64687b6ccf0e");
  });
});
