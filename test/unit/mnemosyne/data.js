"use strict";

const chai = require("chai");
const expect = chai.expect;

const MnemosyneData = require("../../../webapp/lib/mnemosyne/data.js");

describe("MnemosyneData", () => {
  const message = {
    "event": {
      "action": "updated",
      "object_id": "0",
      "object_name": "comment_moderation",
      "object_subtype": "",
      "object_type": "Options"
    },
    "host": "emit",
    "identity": {
      "caps": "administrator",
      "display": "admin",
      "email": "andy@hexten.net",
      "id": "1",
      "login": "admin",
      "nicename": "admin",
      "registered": "2018-09-05 14:37:31",
      "url": ""
    },
    "index": {
      "08ba534d-16f3-a31d-e641-7615cf42699a": "sender:kind",
      "1ac62b22-264f-0213-479c-11374c1623ea": "target.site_url",
      "2264b6a8-a828-1d63-ec2b-f5369c98b6ed": "kind",
      "37a7da91-1f0f-91ee-e13d-f463611803fd": "host",
      "4e4325d6-e483-a007-2752-7ac21610ae1c": "event.object_type:event.object_subtype",
      "50a58568-adc8-a717-ef7e-5ce1058c4790": "event.object_subtype",
      "53e4f61e-8c21-6770-be9d-b1db28782b85": "event.object_name",
      "8336fa70-48cc-9bd1-b486-a9667bcd726f": "sender:host",
      "87f0c07f-d0ba-185f-dffc-8d235793d3d6": "sender",
      "8860a97b-861a-c461-0307-420d4a11d46b": "identity.email",
      "9372c6d4-358c-a7c1-36bb-bccf61a87f89": "event.action",
      "a11e73a7-16b7-5b61-1487-199e3db27bd4": "event.object_id:target.site_url",
      "a4d53f6b-6ca0-8fba-8192-ee1b2b7517c7": "identity.caps",
      "a8e7727b-78a7-2dd9-4fa8-a682827c7045": "event.object_type",
      "da9570c7-c3ed-2b8f-65e7-9adc49578757": "identity.login:target.site_url",
      "fa348c3a-76d7-0b2e-c283-283f8da9a26d": "identity.login"
    },
    "kind": "Activity Log",
    "raw": {
      "action": "updated",
      "display_name": "admin",
      "hist_ip": "127.0.0.1",
      "hist_time": "1536158288",
      "histid": "7",
      "object_id": "0",
      "object_name": "comment_moderation",
      "object_subtype": "",
      "object_type": "Options",
      "siteurl": "https://mn.tthtesting.co.uk",
      "user_caps": "administrator",
      "user_email": "andy@hexten.net",
      "user_id": "1",
      "user_login": "admin",
      "user_nicename": "admin",
      "user_registered": "2018-09-05 14:37:31",
      "user_status": "0",
      "user_url": ""
    },
    "sender": "Wordpress",
    "target": {
      "site_url": "https://mn.tthtesting.co.uk"
    },
    "timing": {
      "busy": {
        "after": 5,
        "before": 10
      },
      "start": "2018-09-05T14:38:08+00:00"
    },
    "uuid": "9d9afe82-5a71-2312-3415-a59e7f5b9597"
  };

  describe("atPath", () => {
    it("should find fields by path", () => {
      const d = new MnemosyneData(message);
      const want = {
        "identity.email": "andy@hexten.net",
        "host": "emit",
      };
      let got = {};
      for (const path of Object.keys(want)) {
        got[path] = d.atPath(path)
      }
      expect(got).to.deep.equal(want);
    });
  });


  describe("indexUUID", () => {
    it("should compute field UUIDs", () => {
      const d = new MnemosyneData(message);
      const want = message.index;
      let got = {};
      for (const set of Object.values(want)) {
        const uuid = d.indexUUID(set);
        got[uuid] = set;
      }
      expect(got).to.deep.equal(want);
    });
  });

  describe("buildIndex", () => {
    it("should build a valid index", () => {
      const d = new MnemosyneData(message);
      const want = message.index;
      const got = d.buildIndex(Object.values(want));
      expect(got).to.deep.equal(want);
    });
  });

  describe("checkIndex", () => {
    it("should ok a valid index", () => {
      const d = new MnemosyneData(message);
      expect(d.checkIndex(message.index)).to.deep.equal([]);
    });

    it("should spot an invalid index", () => {
      const d = new MnemosyneData(message);
      let index = Object.assign({}, message.index);
      const want = [
        {
          uuid: "8860a97b-861a-c461-0307-420d4a11d46b",
          suspect: "8fb2737a-ef8b-45c3-8d2b-3cc6a863ab9b",
          set: "identity.email"
        },
        {
          uuid: "87f0c07f-d0ba-185f-dffc-8d235793d3d6",
          suspect: "55b58ae1-afca-46ea-89b2-38a4bbf75aca",
          set: "sender"
        },
      ];

      for (const fail of want) {
        delete index[fail.uuid];
        index[fail.suspect] = fail.set;
      }

      expect(d.checkIndex(index)).to.deep.equal(want);

    });
  });

  describe("addIndex", () => {
    it("should ignore an existing index", () => {
      const d = new MnemosyneData(message);
      const index = JSON.parse(JSON.stringify(d.index));
      const inv = JSON.parse(JSON.stringify(d.invertedIndex));
      d.addIndex("event.object_type:event.object_subtype");
      expect(d.index).to.deep.equal(index);
      expect(d.invertedIndex).to.deep.equal(inv);
    });

    it("should add a new index", () => {
      const d = new MnemosyneData(message);
      const index = JSON.parse(JSON.stringify(d.index));
      const inv = JSON.parse(JSON.stringify(d.invertedIndex));

      d.addIndex("event.object_type:event.object_id");

      index["73c05820-52a7-a59a-1db6-39d391708115"] = "event.object_type:event.object_id";
      inv["event.object_type:event.object_id"] = "73c05820-52a7-a59a-1db6-39d391708115";

      expect(d.index).to.deep.equal(index);
      expect(d.invertedIndex).to.deep.equal(inv);
    });
  });

});


