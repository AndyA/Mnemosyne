"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../webapp/use.js");

const jpAttr = require("lib/js/tools/jp-attr");

describe("jpAttr", () => {
  class TestClass {
    constructor(name, data) {
      this.name = name;
      this.data = data;
    }
  }

  jpAttr(TestClass, "status", ["$.data.status"]);

  jpAttr(TestClass, "title", [
    "$.data.title",
    "$.data.display.title",
    "$.data.display.alt.title",
    "$.data.display.short_title",
    "$.name"
  ]);

  jpAttr(TestClass, "short_title", [
    "$.data.display.short_title",
    "$.title",
  ]);

  jpAttr(TestClass, "titles", {
    array: true,
    paths: [
      "$.data.title",
      "$.data.display.title",
      "$.data.display.alt.title",
      "$.data.display.short_title"
    ]
  });

  it("should provide a jsonpath attr", () => {

    const o1 = new TestClass("One", {
      status: "pending",
      display: {
        title: "Fish in space",
        alt: {
          title: "Herring in a vacuum"
        }
      }
    });

    const o2 = new TestClass("Two", {
      status: "approved",
      display: {
        short_title: "The Glamour Egg",
        alt: {
          title: "Ant Caviar Haggis"
        }
      }
    });

    const o3 = new TestClass("Three", {});

    expect(o1.status).to.equal("pending");
    expect(o1.title).to.equal("Fish in space");
    expect(o1.short_title).to.equal("Fish in space");
    expect(o1.titles).to.deep.equal(["Fish in space", "Herring in a vacuum"]);

    expect(o2.status).to.equal("approved");
    expect(o2.title).to.equal("Ant Caviar Haggis");
    expect(o2.short_title).to.equal("The Glamour Egg");
    expect(o2.titles).to.deep.equal(["Ant Caviar Haggis", "The Glamour Egg"]);

    expect(o3.status).to.equal(undefined);
    expect(o3.title).to.equal("Three");
    expect(o3.short_title).to.equal("Three");
    expect(o3.titles).to.deep.equal([]);

  });
});
