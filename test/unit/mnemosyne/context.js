"use strict";

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

const expect = chai.expect;

require("../../../webapp/use.js");

const db = require("lib/js/db");
const Trove = require("lib/js/tools/trove");
const MnemosyneContext = require("lib/js/mnemosyne/context");

after(() => {
  db.end(err => {
    if (err) console.log(err);
  });
});

describe("MnemosyneContext", () => {
  const ctx = new MnemosyneContext();

  describe("misc", () => {
    it("should lazy load services, masterBrands", () => {
      expect(ctx.services)
        .to.eventually.be.an.instanceof(Trove);
      expect(ctx.masterBrands)
        .to.eventually.be.an.instanceof(Trove);
    });
  });

  describe("loadProgramme", () => {
    it("should load a programme", () => {
      const uuid = [
        "25652aad-087a-8cde-81a2-cf88f24df5aa",
        "48667b47-9147-9805-0a69-bd1a8d458b68",
        "586c49c2-63d0-7ee4-c8af-714327da5bc4",
        "72c3c2c3-a3e8-0655-bdeb-99cfe457a82a",
        "b08d9182-1da5-3ae6-f211-b5ebbbc99cb9"
      ];
//      ctx.loadProgramme(uuid).then(progs => console.log(progs));

    });
  });

});


