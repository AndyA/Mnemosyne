"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use.js");

const MnemosyneBase = require("lib/js/mnemosyne/base");

describe("MnemosyneBase", () => {
  it("should handle lazyAttr", () => {
    class Test extends MnemosyneBase {
      constructor(data) {
        super(data);
        Object.assign(this, data);
      }
    }

    Test.lazyAttr("area", function() {
      return this.width * this.height;
    });

    const obj = new Test({
      width: 10,
      height: 20
    });

    expect(obj.area).to.equal(200);
  });

  it("should handle jpAttr", () => {
    class Test extends MnemosyneBase {
      constructor(data) {
        super(data);
        Object.assign(this, data);
      }
    }

    Test.jpAttr("moniker", ["$.name", "$.ID"]);

    const obj = new Test({
      name: "Fred",
      ID: 9382
    });

    expect(obj.moniker).to.equal("Fred");
  });
});
