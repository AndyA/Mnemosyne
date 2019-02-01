"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../webapp/use.js");

const lazyAttr = require("lib/js/tools/lazy-attr");

class TestClass {
  constructor(name) {
    this.name = name;
  }
}

lazyAttr(TestClass, "fruit", function() {
  return this.name + " Orange";
});

describe("lazyAttr", () => {
  it("should provide lazy attr", () => {
    const o1 = new TestClass("Fred");
    expect(o1.fruit).to.equal("Fred Orange");
    const o2 = new TestClass("Anne");
    expect(o2.fruit).to.equal("Anne Orange");
    expect(o1.fruit).to.equal("Fred Orange");
    o2.name = "Sam";
    expect(o2.fruit).to.equal("Anne Orange");
  });
});
