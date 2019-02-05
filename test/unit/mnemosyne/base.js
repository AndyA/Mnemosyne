"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const MnemosyneBase = require("lib/js/mnemosyne/base");

describe("MnemosyneBase", () => {
  it("should handle missing raw data", () => {
    let obj = new MnemosyneBase({
      foo: 1
    });

    expect(obj.data).to.deep.equal({
      foo: 1,
      raw: null
    });
  });

  it("should parse raw JSON", () => {
    let obj = new MnemosyneBase({
      foo: 2,
      raw: "{\"bar\":1}"
    });

    expect(obj.data).to.deep.equal({
      foo: 2,
      raw: {
        bar: 1
      }
    });
  });
});
