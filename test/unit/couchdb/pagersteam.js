"use strict";

const chai = require("chai");
const expect = chai.expect;

const Promise = require("bluebird");

require("../../../webapp/use.js");

const PagerStream = require("lib/js/couchdb/pagerstream.js");

class TestPager {
  constructor(pageSize, limit) {
    this.pageSize = pageSize;
    this.limit = limit;
    this.nextID = 1;
  }

  nextPage() {
    if (this.limit === 0)
      return Promise.resolve({
        rows: []
      });

    return Promise.delay(10).then(() => {
      const size = Math.min(this.pageSize, this.limit);

      let rows = [];
      for (let i = 0; i < size; i++) {
        const id = this.nextID++;
        rows.push({
          id: id,
          key: [id],
          value: null,
          doc: {}
        });
      }

      this.limit -= rows.length;

      return {
        total_rows: 10000,
        offset: 0,
        rows
      };
    });
  }
}

function drainStream(rs) {
  return new Promise((resolve, reject) => {
    let docs = [];
    rs.on("data", doc => docs.push(doc)).on("end", () => resolve(docs));
  });
}

describe("Pager", () => {
  it("should wrap a pager", async () => {
    const pager = new TestPager(10, 35);
    const rs = new PagerStream(pager);
    const got = await drainStream(rs);
    const want = new Array(35).fill(0).map((z, i) => ({
      id: i + 1,
      key: [i + 1],
      value: null,
      doc: {}
    }));
    expect(got).to.deep.equal(want);
  });
});

