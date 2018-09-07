"use strict";

const chai = require("chai");
const expect = chai.expect;

const MnemosyneHash = require("../../../webapp/lib/mnemosyne/hash.js");

describe("MnemosyneHash", () => {

  describe("UUIDs", () => {
    it("should format a UUID", () => {
      expect(MnemosyneHash.formatUUID("a11e73a716b75b611487199e3db27bd4"))
        .to.equal("a11e73a7-16b7-5b61-1487-199e3db27bd4");
    });

    it("should create a valid UUID", () => {
      expect(MnemosyneHash.createUUID(["andy@hexten.net"]))
        .to.equal("8860a97b-861a-c461-0307-420d4a11d46b");
    });
  });

});

