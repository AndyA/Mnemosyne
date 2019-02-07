"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../webapp/use.js");

const sorter = require("lib/js/tools/sorter");

function testSort(data, ...keys) {
  return data.slice(0).sort(sorter(keys));
}

describe("sorter", () => {
  const data = [
    {
      name: "Sam",
      age: 48,
      place: "Pike Lane Cottage",
      score: 100
    },
    {
      name: "Andy",
      age: 57,
      place: "Pike Lane Cottage",
      score: 10
    },
    {
      name: "Monda",
      age: 21,
      place: "Monda's Gaff",
      score: 1000
    },
    {
      name: "Pizz",
      age: 8,
      place: "Pike Lane Cottage",
      score: 1
    },
  ];

  it("should sort lexically", () => {
    expect(testSort(data, "name"))
      .to.deep.equal([data[1], data[2], data[3], data[0]]);
  });

  it("sould sort numerically", () => {
    expect(testSort(data, "#score"))
      .to.deep.equal([data[3], data[1], data[0], data[2]]);
  });

  it("sould handle multiple keys, descending", () => {
    expect(testSort(data, "-place", "+#score"))
      .to.deep.equal([data[3], data[1], data[0], data[2]]);
  });

});
