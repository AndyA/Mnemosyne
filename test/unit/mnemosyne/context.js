"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const expect = chai.expect;

require("../../../webapp/use.js");

const db = require("lib/js/db");
const MnemosyneContext = require("lib/js/mnemosyne/context");

after(() => {
  db.end(err => {
    if (err) console.log(err);
  });
});

describe("MnemosyneContext", () => {
});


