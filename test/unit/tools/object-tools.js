"use strict";


const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const ObjectTools = require("lib/js/tools/object-tools");

class Base {
  constructor(seq) {
    this.seq = seq;
    this._private = [];
  }

  get sequence() {
    return this.seq * 1000;
  }

  static get kind() {
    return "document";
  }

  static get ident() {
    return "5c3079bc-008d-43e0-b698-da8ff75e33b0";
  }

  toJSON() {
    const props = getReadable(this);
    let json = {};
    for (const prop of props)
      json[prop] = this[prop];
    return json;
  }
}

class Derived extends Base {
  constructor(id, seq) {
    super(seq);
    this._id = id;
  }

  static get ident() {
    return "a5912f17-5f1d-4881-be9e-b31ce2e5c849";
  }

  set availability(a) {
    this.available = a;
  }

  get name() {
    return "Object " + this._id;
  }
}

describe("ObjectTools", () => {
  it("should find readable properties", () => {
    const obj = new Derived(1, 2);
    expect(ObjectTools.getReadable(obj)).to.deep.equal([
      "seq", "_id", "name", "sequence"
    ]);
  });
});
