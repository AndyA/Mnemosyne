"use strict";

const chai = require("chai");
const expect = chai.expect;
const _ = require("lodash");

require("../../../webapp/use.js");

const MnemosyneVersions = require("lib/js/mnemosyne/versions");

const cases = [
  {
    name: "should handle scalars",
    tests: [
      {
        doc: undefined,
        before: undefined,
        after: "Foo",
        expect: "Foo"
      },
      {
        doc: "Barley",
        before: "Barley",
        after: "Bar",
        expect: "Bar"
      },
      {
        doc: "Spigot",
        before: "Spigot",
        after: undefined,
        expect: undefined
      },
    ]
  },
  {
    name: "should handle arrays",
    tests: [
      {
        doc: undefined,
        before: undefined,
        after: ["Foo"],
        expect: ["Foo"]
      },
      {
        doc: "Barley",
        before: "Barley",
        after: ["Bar"],
        expect: ["Bar"]
      },
      {
        doc: ["Spigot"],
        before: ["Spigot"],
        after: ["Fiz"],
        expect: ["Fiz"]
      },
      {
        doc: ["Plinth"],
        before: ["Plinth"],
        after: "Baz",
        expect: "Baz"
      },
    ]
  },
  {
    name: "should detect mismatches",
    throws: /mismatch/,
    tests: [
      {
        doc: undefined,
        before: "Foo",
        after: ["Foo"],
      },
      {
        doc: "Barley",
        before: "Bareley",
        after: ["Bar"],
      },
      {
        doc: ["Spigot"],
        before: "Spigot",
        after: ["Fiz"],
      },
      {
        doc: "Plinth",
        before: ["Plinth"],
        after: "Baz",
      },
      {
        doc: {
          name: "Andy",
          log: [1, 2, 3]
        },
        before: {
          log: [1, 2, 4]
        },
        after: {
          log: [1, 2, 5]
        },
      },
      {
        doc: {
          name: "Andy",
          date: "2019-01-07",
          meta: {
            title: "Hoskins",
            versions: [1, 2, 3]
          }
        },
        before: {
          meta: {
            versions: [1, 2, 4]
          }
        },
        after: {
          meta: {
            versions: [1, 2, 3, 4]
          }
        },
      },
    ]
  },
  {
    name: "should handle structured docs",
    tests: [
      {
        doc: {
          name: "Andy",
          date: "2019-01-07"
        },
        before: {
          name: "Andy"
        },
        after: {
          name: "Sam"
        },
        expect: {
          name: "Sam",
          date: "2019-01-07"
        },
      },
      {
        doc: {
          name: "Andy",
          date: "2019-01-07"
        },
        before: {
          name: "Andy"
        },
        after: {},
        expect: {
          date: "2019-01-07"
        },
      },
      {
        doc: {
          meta: {
            name: "Andy",
            date: "2019-01-07"
          },
        },
        before: {
          meta: {
            name: "Andy"
          },
        },
        after: {
          meta: {}
        },
        expect: {
          meta: {
            date: "2019-01-07"
          }
        },
      },
      {
        doc: {
          name: "Andy",
          date: "2019-01-07",
          meta: {
            title: "Hoskins",
            versions: [1, 2, 3]
          }
        },
        before: {
          meta: {
            versions: [1, 2, 3]
          }
        },
        after: {
          meta: {
            versions: [1, 2, 3, 4]
          }
        },
        expect: {
          name: "Andy",
          date: "2019-01-07",
          meta: {
            title: "Hoskins",
            versions: [1, 2, 3, 4]
          }
        },
      },
    ]
  },
  {
    name: "should handle nulls",
    tests: [
      {
        doc: null,
        before: null,
        after: ["Foo"],
        expect: ["Foo"]
      },
      {
        doc: null,
        before: null,
        after: [null],
        expect: [null]
      },
      {
        doc: {
          name: null,
          date: null
        },
        before: {
          name: null
        },
        after: {
          name: "Andy"
        },
        expect: {
          name: "Andy",
          date: null
        },
      },
    ]
  },

];

describe.only("MnemosyneVersions", () => {
  describe("applyEdit", () => {
    for (const tc of cases) {
      it(tc.name, () => {
        for (const t of tc.tests) {
          if (tc.throws) {
            expect(() => MnemosyneVersions.applyEdit(t.doc, t.before, t.after)).to.throw(tc.throws);
          } else {
            const doc = _.cloneDeep(t.doc);
            const edit = MnemosyneVersions.applyEdit(t.doc, t.before, t.after);
            expect(edit, "edit applied").to.deep.equal(t.expect);
            const orig = MnemosyneVersions.applyEdit(edit, t.after, t.before);
            expect(orig, "edit reverted").to.deep.equal(t.doc);
            expect(doc, "doc unchanged").to.deep.equal(t.doc);
          }
        }
      });
    }
  });

  describe("deepDiff", () => {
    for (const tc of cases) {
      if (tc.throws) continue;
      it(tc.name, () => {
        for (const t of tc.tests) {
          expect(MnemosyneVersions.deepDiff(t.doc, t.expect), "forward patch").to.deep.equal({
            before: t.before,
            after: t.after
          });
          expect(MnemosyneVersions.deepDiff(t.expect, t.doc), "reverse patch").to.deep.equal({
            before: t.after,
            after: t.before
          });
        }
      });
    }

  });

});

