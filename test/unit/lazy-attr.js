"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../webapp/use.js");

const lazyAttr = require("lib/js/tools/lazy-attr");

describe("lazyAttr", () => {
  let called = {};

  class TestClass {
    constructor(name) {
      this.name = name;
    }
  }

  lazyAttr(TestClass, "fruit", function(name) {
    called[name] = (called[name] || 0) + 1;
    return this.name + " Orange";
  });

  lazyAttr(TestClass, "fruitLength", function(name) {
    called[name] = (called[name] || 0) + 1;
    return this.fruit.length;
  });

  it("should provide lazy attr", () => {
    const o1 = new TestClass("Fred");
    expect(o1.fruit).to.equal("Fred Orange");
    expect(o1.fruitLength).to.equal("Fred Orange".length);

    const o2 = new TestClass("Anne");
    expect(o2.fruitLength).to.equal("Anne Orange".length);
    expect(o2.fruit).to.equal("Anne Orange");

    expect(o1.fruit).to.equal("Fred Orange");
    o2.name = "Sam";
    expect(o2.fruit).to.equal("Anne Orange");

    expect(called).to.deep.equal({
      fruit: 2,
      fruitLength: 2
    });
  });

  it("should throw on non-bindable function", () => {
    expect(() => {
      lazyAttr(TestClass, "nb", () => {
      })
    }).to.throw(/bindable/);
  });
});
