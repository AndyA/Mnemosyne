"use strict";

const chai = require("chai");
const expect = chai.expect;

const Promise = require("bluebird");
const _ = require("lodash");

require("../../../webapp/use.js");

const MnemosyneContext = require("lib/js/mnemosyne/context");
const {Pager, PageAll, PageView} = require("lib/js/couchdb/pager.js");

const designName = "live";
const viewName = "pidOrID";

describe("Pager", () => {
  let refAll;
  let refView;
  let ctx;

  before(async () => {
    ctx = new MnemosyneContext();
    [refAll, refView] = await Promise.all(
      [
        ctx.db.list({
          reduce: false,
          include_docs: true,
          limit: 100
        }),
        ctx.db.view(designName, viewName, {
          reduce: false,
          include_docs: true,
          limit: 100
        })
      ]
    );
  });

  async function drainPager(pager) {
    let out = [];
    while (true) {
      const docs = await pager.nextPage();
      if (docs.rows.length === 0) break;
      out.push(docs.rows);
    }
    return out;
  }

  async function testPager(ref, pos, pageSize, limit, getPager) {
    let expectDocs = ref.slice(pos, pos + limit);

    let params = {
      reduce: false,
      include_docs: true,
      page_size: pageSize,
      limit: expectDocs.length
    };

    if (pos !== 0) {
      params.startkey = expectDocs[0].key;
      params.startkey_docid = expectDocs[0].id;
    }

    const pager = getPager(ctx.db, params);
    const got = await drainPager(pager);

    const expectChunks = _.chunk(expectDocs, pageSize);
    expect(got).to.deep.equal(expectChunks);
  }

  for (let pos of [0, 17]) {
    for (let pageSize of [1, 2, 1000]) {
      for (let limit of [1, 200]) {
        const desc = `pos: ${pos}, pageSize: ${pageSize}, limit: ${limit}`;
        it(`should read all docs (${desc})`, async () => {
          await testPager(refAll.rows, pos, pageSize, limit,
            (db, params) => new PageAll(db, params));
        });
        it(`should read a view (${desc})`, async () => {
          await testPager(refView.rows, pos, pageSize, limit,
            (db, params) => new PageView(db, designName, viewName, params));
        });
      }
    }
  }
});
