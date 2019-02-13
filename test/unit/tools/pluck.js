"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const Pluck = require("lib/js/tools/pluck");

describe("Pluck", () => {
  describe("pluck", () => {

    it("should handle a single object, simple shape", () => {
      expect(Pluck.pluck({
        name: "Fred"
      }, "$.name")).to.deep.equal("Fred");
    });

    it("should handle an array of shapes", () => {
      expect(Pluck.pluck({
        name: "Fred",
        age: 32
      }, ["$.name", "$.age"])).to.deep.equal(["Fred", 32]);
    });

    it("should handle an object of shapes", () => {
      expect(Pluck.pluck({
        name: "Fred",
        age: 32
      }, {
        moniker: "$.name",
        age: "$.age"
      })).to.deep.equal({
        moniker: "Fred",
        age: 32
      });
    });

    it("should handle arrays", () => {
      expect(Pluck.pluck([{
        name: "Fred"
      }, {
        name: "Ginger"
      }], "$.name")).to.deep.equal(["Fred", "Ginger"]);
    });

  });

  describe("pluckValues", () => {
    const data = {
      one: {
        name: "One",
        type: "Number"
      },
      two: {
        name: "Two",
        type: "Number"
      }
    };

    it("should pluck from an object", () => {
      expect(Pluck.pluckValues(data, "$.name")).to.deep.equal({
        one: "One",
        two: "Two"
      });
    });
  });
});
