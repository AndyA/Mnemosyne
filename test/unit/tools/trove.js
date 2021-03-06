"use strict";

const chai = require("chai");
const expect = chai.expect;

require("../../../webapp/use");

const Trove = require("lib/js/tools/trove");

describe("Trove", () => {
  const rows = [{
    ID: 1,
    name: "Sam"
  }, {
    ID: 2,
    name: "Andy"
  }, {
    ID: 3,
    name: "Monda"
  }, {
    ID: 4,
    name: "Andy"
  }];

  const t = new Trove(rows);

  it("should find by unique key", () => {
    expect(t.find("ID", 1)).to.deep.equal(rows[0]);
    expect(t.find("ID", 3)).to.deep.equal(rows[2]);
  });

  it("should find by non-unique key", () => {
    expect(t.findAll("name", "Pizzo")).to.deep.equal([]);
    expect(t.findAll("name", "Andy")).to.deep.equal([rows[1], rows[3]]);
    expect(t.findAll("ID", 1)).to.deep.equal([rows[0]]);
  });

  it("should sort", () => {
    const st = t.sorted("name", "-#ID");
    expect(st.rows).to.deep.equal([rows[3], rows[1], rows[2], rows[0]]);
    expect(st.findAll("name", "Andy")).to.deep.equal([rows[3], rows[1]]);
  });

  it("should handle singletons", () => {
    const ts = new Trove([{
      id: 1
    }]);
    const te = new Trove([]);
    const tm = new Trove([{
      id: 1
    }, {
      id: 2
    }]);

    expect(ts.singleton).to.deep.equal({
      id: 1
    });
    expect(te.singleton).to.be.undefined;
    expect(() => {
      tm.singleton
    }).to.throw(/not a singleton/);
  });
});
