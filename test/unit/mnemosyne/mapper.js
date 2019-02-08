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

  it("should look up kind", () => {
    const lookup = [
      "1ffaab07-c2ac-a2aa-1f13-b78e42a8ed41",
      "2ab1fadf-3a11-81b9-9b2c-07c503a8b332",
      "a7eec0de-65ae-a10c-9eb2-4ad728492cb4",
      "2ef94d29-aabd-a4ee-d3dd-87df8e277671",
      "01f5ad02-ae63-0df8-42b5-49b22263558d",
      "p0063l31",
      "p005ttvz",
      "p005r1y1",
      "p005sp2k",
      "p005mj32"
    ];

    const want = {
      "1ffaab07-c2ac-a2aa-1f13-b78e42a8ed41": {
        key: "uuid",
        uuid: "1ffaab07-c2ac-a2aa-1f13-b78e42a8ed41",
        ID: "p005rtcy",
        table: "mnemosyne_broadcast"
      },
      "2ab1fadf-3a11-81b9-9b2c-07c503a8b332": {
        key: "uuid",
        uuid: "2ab1fadf-3a11-81b9-9b2c-07c503a8b332",
        ID: "p005xcsd",
        table: "mnemosyne_broadcast"
      },
      "a7eec0de-65ae-a10c-9eb2-4ad728492cb4": {
        key: "uuid",
        uuid: "a7eec0de-65ae-a10c-9eb2-4ad728492cb4",
        ID: "p005pb3d",
        table: "mnemosyne_broadcast"
      },
      "2ef94d29-aabd-a4ee-d3dd-87df8e277671": {
        key: "uuid",
        uuid: "2ef94d29-aabd-a4ee-d3dd-87df8e277671",
        ID: "p005mj5d",
        table: "mnemosyne_broadcast"
      },
      "01f5ad02-ae63-0df8-42b5-49b22263558d": {
        key: "uuid",
        uuid: "01f5ad02-ae63-0df8-42b5-49b22263558d",
        ID: "b00pq9s0",
        table: "mnemosyne_episode"
      },
      "p0063l31": {
        key: "ID",
        uuid: "134d38de-8b63-972a-4175-85f3ab4659ae",
        ID: "p0063l31",
        table: "mnemosyne_broadcast"
      },
      "p005ttvz": {
        key: "ID",
        uuid: "fa96e218-bc61-d45f-d70f-483f6df9f833",
        ID: "p005ttvz",
        table: "mnemosyne_broadcast"
      },
      "p005r1y1": {
        key: "ID",
        uuid: "a37c3078-a8bf-87a7-8a93-bfbe5c2f63b1",
        ID: "p005r1y1",
        table: "mnemosyne_broadcast"
      },
      "p005sp2k": {
        key: "ID",
        uuid: "a8511bea-2ae3-46ca-1571-04018ffbec72",
        ID: "p005sp2k",
        table: "mnemosyne_broadcast"
      },
      "p005mj32": {
        key: "ID",
        uuid: "2794a20d-2eb3-0338-5e49-04500938caf4",
        ID: "p005mj32",
        table: "mnemosyne_broadcast"
      }
    };

    expect(redir.lookupKind(lookup))
      .to.eventually.deep.equal(want);

    expect(redir.lookupKind("1ffaab07-c2ac-a2aa-1f13-b78e42a8ed41")).to.eventually.deep.equal({
      key: "uuid",
      uuid: "1ffaab07-c2ac-a2aa-1f13-b78e42a8ed41",
      ID: "p005rtcy",
      table: "mnemosyne_broadcast"
    });

    expect(redir.lookupKind("foobar")).to.eventually.be.undefined;
  });

});
