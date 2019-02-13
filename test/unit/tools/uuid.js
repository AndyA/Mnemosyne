"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const UUID = require("lib/js/tools/uuid.js");

describe("UUID", () => {

  describe("hash", () => {
    it("should strip hyphens", () => {
      expect(UUID.hash("F26D77DD-24AB-406D-8540-3B386C77BA45"))
        .to.equal("f26d77dd24ab406d85403b386c77ba45");
    });

    it("should pass through", () => {
      expect(UUID.hash("f26d77dd24ab406d85403b386c77ba45"))
        .to.equal("f26d77dd24ab406d85403b386c77ba45");
    });
  });

  describe("validHash", () => {
    it("should validate", () => {
      expect(UUID.validHash("f26d77dd24ab406d85403b386c77ba45")).to.be.true;
      expect(UUID.validHash("f26d77dd24ab406d85403b386c77ba4")).to.be.false;
      expect(UUID.validHash("f26d77dd24ab406d85403b386c77ba45a")).to.be.false;
      expect(UUID.validHash("F26D77DD24AB406D85403B386C77BA45")).to.be.false;
      expect(UUID.validHash(null)).to.be.false;
    });
  });

  describe("valid", () => {
    it("should validate", () => {
      expect(UUID.valid("f26d77dd-24ab-406d-8540-3b386c77ba45")).to.be.true;
      expect(UUID.valid("F26D77DD-24AB-406D-8540-3B386C77BA45")).to.be.false;
      expect(UUID.valid("f26d77dd24ab406d85403b386c77ba45")).to.be.false;
      expect(UUID.valid("f26d77dd24ab406d85403b386c77ba4")).to.be.false;
      expect(UUID.valid("f26d77dd24ab406d85403b386c77ba45a")).to.be.false;
      expect(UUID.valid("F26D77DD24AB406D85403B386C77BA45")).to.be.false;
      expect(UUID.valid(null)).to.be.false;
    });
  });

  describe("format", () => {
    it("should format a hash", () => {
      expect(UUID.format("f26d77dd24ab406d85403b386c77ba45"))
        .to.equal("f26d77dd-24ab-406d-8540-3b386c77ba45");
    });

    it("should pass a UUID through", () => {
      expect(UUID.format("f26d77dd-24ab-406d-8540-3b386c77ba45"))
        .to.equal("f26d77dd-24ab-406d-8540-3b386c77ba45");
    });

    it("should handle uppercase", () => {
      expect(UUID.format("F26D77DD24AB406D85403B386C77BA45"))
        .to.equal("f26d77dd-24ab-406d-8540-3b386c77ba45");
      expect(UUID.format("F26D77DD-24AB-406D-8540-3B386C77BA45"))
        .to.equal("f26d77dd-24ab-406d-8540-3b386c77ba45");
    });

    it("should throw an error for invalid input", () => {
      expect(() => UUID.format("f26d77dd24ab406d85403b386c77ba4")).to.throw(/Invalid/);
    });
  });

  describe("toHash", () => {
    it("should convert to hashes", () => {
      expect(UUID.toHash("f26d77dd-24ab-406d-8540-3b386c77ba45"))
        .to.equal("f26d77dd24ab406d85403b386c77ba45");
      expect(UUID.toHash("f26d77dd24ab406d85403b386c77ba45"))
        .to.equal("f26d77dd24ab406d85403b386c77ba45");
      expect(UUID.toHash("x000pghu"))
        .to.equal("x000pghu");
      expect(UUID.toHash([
        "f26d77dd-24ab-406d-8540-3b386c77ba45", "f26d77dd24ab406d85403b386c77ba45", "x000pghu"
      ]))
        .to.deep.equal([
        "f26d77dd24ab406d85403b386c77ba45", "f26d77dd24ab406d85403b386c77ba45", "x000pghu"
      ]);
    });
  });

  describe("toUUID", () => {
    it("should convert to hashes", () => {
      expect(UUID.toUUID("f26d77dd-24ab-406d-8540-3b386c77ba45"))
        .to.equal("f26d77dd-24ab-406d-8540-3b386c77ba45");
      expect(UUID.toUUID("f26d77dd24ab406d85403b386c77ba45"))
        .to.equal("f26d77dd-24ab-406d-8540-3b386c77ba45");
      expect(UUID.toUUID("x000pghu"))
        .to.equal("x000pghu");
      expect(UUID.toUUID([
        "f26d77dd-24ab-406d-8540-3b386c77ba45", "f26d77dd24ab406d85403b386c77ba45", "x000pghu"
      ]))
        .to.deep.equal([
        "f26d77dd-24ab-406d-8540-3b386c77ba45", "f26d77dd-24ab-406d-8540-3b386c77ba45", "x000pghu"
      ]);
    });
  });

  describe("make", () => {

    const td = [
      ["mnemosyne_pips_master_brand", "bbc_cantonese_radio", "59bfffba-561c-700a-7d91-566140612590"],
      ["mnemosyne_pips_master_brand", "bbc_parliament", "3ad032b6-1498-3bf5-6b96-1fc10262339b"],
      ["mnemosyne_pips_master_brand", "bbc_radio_bristol", "3cbad5c4-8370-8a71-d0cc-40e55f5feb34"],
      ["mnemosyne_pips_master_brand", "bbc_radio_cymru_mwy", "8b8e7173-acdd-295b-e1b2-954479c47043"],
      ["mnemosyne_pips_master_brand", "bbc_radio_shropshire", "c86bfada-97f1-d532-fed3-85481ba59a1c"],
      ["mnemosyne_pips_service", "bbc_one_london", "bfb69a2e-5d7f-7db5-3ead-bfd7b16e1d53"],
      ["mnemosyne_pips_service", "bbc_radio_berkshire", "00ed5913-ae8f-1e97-ba9f-f47a4ff57e92"],
      ["mnemosyne_pips_service", "bbc_radio_cumbria", "f5cda5e3-03f8-5930-770a-9dd05ed2e4f8"],
      ["mnemosyne_pips_service", "bbc_radio_northampton", "285d48e9-e550-28b7-5621-2025e320ad6d"],
      ["mnemosyne_pips_service", "bbc_radio_wales_am", "ca132c96-3788-a4eb-4e69-faef5aecae4a"]
    ];

    it("should compute the right UUID", () => {
      for (const tc of td) {
        const [kind, id, uuid] = tc;
        expect(UUID.make(kind, id)).to.equal(uuid);
      }
    });

    it("should error on missing info", () => {
      expect(() => UUID.make("mnemosyne_foo")).to.throw(/Missing/);
    });

    it("should handle a namespace prefix", () => {
      expect(UUID.make("PIPS", "Foo")).to.equal("8f22139a-0d00-aac9-0679-51acd64cf43d");
      expect(UUID.make("PIPS", "MasterBrand", "Foo")).to.equal("124fb759-79a6-1c1d-61b5-64687b6ccf0e");
    });

  });

  describe("OO", () => {
    it("should allow a hash", () => {
      const u = new UUID("285d48e9e55028b756212025e320ad6d");
      expect(u.hash).to.equal("285d48e9e55028b756212025e320ad6d");
      expect(u.uuid).to.equal("285d48e9-e550-28b7-5621-2025e320ad6d");
      expect("" + u).to.equal("285d48e9-e550-28b7-5621-2025e320ad6d");
    });

    it("should allow a UUID", () => {
      const u = new UUID("285D48E9-E550-28B7-5621-2025E320AD6D");
      expect(u.hash).to.equal("285d48e9e55028b756212025e320ad6d");
      expect(u.uuid).to.equal("285d48e9-e550-28b7-5621-2025e320ad6d");
      expect("" + u).to.equal("285d48e9-e550-28b7-5621-2025e320ad6d");
    });

    it("should error on bad input", () => {
      expect(() => new UUID("foo")).to.throw(/Invalid/);
    });

  });

});
