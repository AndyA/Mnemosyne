"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const MnemosyneDocument = require("lib/js/mnemosyne/document");

describe("MnemosyneDocument", () => {
  it("should handle arbitrary data", () => {
    let obj = new MnemosyneDocument({
      foo: 1
    });

    expect(obj).to.deep.equal({
      foo: 1
    });
  });

  it("should make link", () => {
    let obj = new MnemosyneDocument({
      _id: "f5171a00422444c89474c2148e5e4d97"
    });
    expect(obj.link).to.equal("/f5171a00422444c89474c2148e5e4d97");
  });

  it("should serialize", () => {
    let obj = new MnemosyneDocument({
      _id: "f5171a00422444c89474c2148e5e4d97"
    });

    expect(JSON.parse(JSON.stringify(obj))).to.deep.equal({
      _id: "f5171a00422444c89474c2148e5e4d97", 
      link: "/f5171a00422444c89474c2148e5e4d97"
    });

  });
});
