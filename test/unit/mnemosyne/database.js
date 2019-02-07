"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const expect = chai.expect;

require("../../../webapp/use.js");

const db = require("lib/js/db");
const MnemosyneDatabase = require("lib/js/mnemosyne/database");
const MnemosyneService = require("lib/js/mnemosyne/service");

after(() => {
  db.end(err => {
    if (err) console.log(err);
  });
});

describe("MnemosyneDatabase", () => {
  describe("loadAll", () => {
    it("should load all services", done => {
      MnemosyneDatabase.loadAll(MnemosyneService).then(trove => {
        const r1x = trove.find("ID", "bbc_1xtra");
        expect(r1x.name)
          .to.equal("BBC Radio 1Xtra");
        done();
      }, done);
    });
  });
});

