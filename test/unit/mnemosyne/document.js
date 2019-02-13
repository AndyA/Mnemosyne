"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const MnemosyneDocument = require("lib/js/mnemosyne/document");

describe("MnemosyneDocument", () => {
  it("should handle missing raw data", () => {
    let obj = new MnemosyneDocument({
      foo: 1
    });

    expect(obj).to.deep.equal({
      foo: 1
    });
  });

  it("should parse raw JSON", () => {
    let obj = new MnemosyneDocument({
      foo: 2,
      raw: "{\"bar\":1}"
    });

    expect(obj).to.deep.equal({
      foo: 2,
      raw: {
        bar: 1
      }
    });
  });

  it("should allow structured data", () => {
    let obj = new MnemosyneDocument({
      foo: 2,
      raw: {
        bar: 1
      }
    });

    expect(obj).to.deep.equal({
      foo: 2,
      raw: {
        bar: 1
      }
    });
  });

  it("should find ID, uuid", () => {
    let obj = new MnemosyneDocument({
      ID: "the_id",
      uuid: "f5171a00-4224-44c8-9474-c2148e5e4d97"
    });

    let obj2 = new MnemosyneDocument({
      uuid: "f5171a00-4224-44c8-9474-c2148e5e4d97"
    });

    expect(obj.ID).to.equal("the_id");
    expect(obj.uuid).to.equal("f5171a00-4224-44c8-9474-c2148e5e4d97");
    expect(obj.link).to.equal("/the_id");

    expect(obj2.link).to.equal("/f5171a00422444c89474c2148e5e4d97");
  });
});
