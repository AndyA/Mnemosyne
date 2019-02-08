"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const expect = chai.expect;

require("../../../webapp/use.js");

const db = require("lib/js/db");
const Trove = require("lib/js/tools/trove");
const MnemosyneMapper = require("lib/js/mnemosyne/mapper");

after(() => {
  db.end(err => {
    if (err) console.log(err);
  });
});

describe("MnemosyneMapper", () => {
  const redir = new MnemosyneMapper();

  it("should redirect", () => {
    expect(redir.redirect(["test_from_1", "test_from_2", "test_from_3"]))
      .to.eventually.deep.equal({
      test_from_1: "test_to",
      test_from_2: "test_to"
    });
    expect(redir.redirect("test_from_1"))
      .to.eventually.equal("test_to");
    expect(redir.redirect("test_from_3"))
      .to.eventually.be.undefined;
  });
});
