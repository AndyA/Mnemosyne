"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const jpAttr = require("lib/js/tools/jp-attr");

describe("jpAttr", () => {
  class TestClass {
    constructor(name, data) {
      this.name = name;
      this.data = data;
    }
  }

  jpAttr(TestClass, "status", [
    "$.data.status",
    () => "unknown"
  ]);

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

  jpAttr(TestClass, "parsed", {
    parser: function(v, name) {
      return [v, this.name, name].join(", ");
    },
    paths: "$.title"
  });

  jpAttr(TestClass, "named", {
    parser: function(v, name) {
      return [v, this.name, name].join(", ");
    },
    array: true,
    paths: [
      "$.data.title",
      "$.data.display.title",
      "$.data.display.alt.title",
      "$.data.display.short_title"
    ]
  });

  jpAttr(TestClass, "allTitles", {
    array: true,
    transform: function(v, name) {
      return v.join(", ");
    },
    paths: [
      "$.data.title",
      "$.data.display.title",
      "$.data.display.alt.title",
      "$.data.display.short_title"
    ]
  });

  jpAttr(TestClass, "defaultMatch", ["$.I.do.not.exist", "Not here!"]);

  jpAttr(TestClass, "attr", {
    paths: "$.data.attr[*].a[*]",
    array: true
  });

  const o1 = new TestClass("One", {
    status: "pending",
    display: {
      title: "Fish in space",
      alt: {
        title: "Herring in a vacuum"
      }
    },
    attr: [
      {
        a: [
          {
            name: "foo",
            value: "Antique"
          },
          {
            name: "bar",
            value: "Modern"
          }
        ]
      }, {
        a: [
          {
            name: "baz",
            value: "Ancient"
          }
        ]
      }
    ]
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

  it("should provide a jsonpath attr", () => {

    expect(o1.status).to.equal("pending");
    expect(o1.title).to.equal("Fish in space");
    expect(o1.short_title).to.equal("Fish in space");
    expect(o1.titles).to.deep.equal(["Fish in space", "Herring in a vacuum"]);

    expect(o2.status).to.equal("approved");
    expect(o2.title).to.equal("Ant Caviar Haggis");
    expect(o2.short_title).to.equal("The Glamour Egg");
    expect(o2.titles).to.deep.equal(["Ant Caviar Haggis", "The Glamour Egg"]);

    expect(o3.status).to.equal("unknown");
    expect(o3.title).to.equal("Three");
    expect(o3.short_title).to.equal("Three");
    expect(o3.titles).to.deep.equal([]);

    expect(o1.defaultMatch).to.equal("Not here!");

  });

  it("should handle complex arrays", () => {
    expect(o1.attr).to.deep.equal([
      {
        name: "foo",
        value: "Antique"
      },
      {
        name: "bar",
        value: "Modern"
      },
      {
        name: "baz",
        value: "Ancient"
      }
    ]);
  });

  it("should parse the computed value", () => {
    expect(o1.parsed).to.equal("Fish in space, One, parsed");
    expect(o1.named).to.deep.equal([
      "Fish in space, One, named",
      "Herring in a vacuum, One, named"
    ]);

    expect(o1.allTitles).to.equal("Fish in space, Herring in a vacuum");

    expect(o2.parsed).to.equal("Ant Caviar Haggis, Two, parsed");
    expect(o3.parsed).to.equal("Three, Three, parsed");
  });

  it("should allow data to override props", () => {
    const lit = new TestClass("Literal", {
      title: "Horncrake"
    });
    expect(lit.title).to.equal("Horncrake");
  });
});

