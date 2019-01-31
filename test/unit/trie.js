"use strict";

const chai = require("chai");
const expect = chai.expect;

const Trie = require("../../webapp/lib/js/trie.js")
const ArrayPicker = require("../../webapp/lib/js/array-picker.js");
const Board = require("../../webapp/lib/js/board.js");
const makeTile = require("../../webapp/lib/js/tile.js")
  .makeTile;

function randomWord() {
  const len = Math.floor(Math.random() * Math.random() * 15 + 2);
  let word = [];
  for (let i = 0; i < len; i++) {
    const lt = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    word.push(lt);
  }
  return word.join("");
}

function randomWords(count) {
  let words = [];
  for (let i = 0; i < count; i++)
    words.push(randomWord());
  words.sort();
  return words;
}

describe("Trie", () => {
  const trie = new Trie(["CAT", "CATHARSIS", "CATS", "FLOAT",
    "FLOATER", "FLOATS"
  ]);

  describe("trie", () => {
    const want = {
      "C": {
        "A": {
          "T": {
            "*": {},
            "H": {
              "A": {
                "R": {
                  "S": {
                    "I": {
                      "S": {
                        "*": {}
                      }
                    }
                  }
                }
              }
            },
            "S": {
              "*": {}
            }
          }
        }
      },
      "F": {
        "L": {
          "O": {
            "A": {
              "T": {
                "*": {},
                "E": {
                  "R": {
                    "*": {}
                  }
                },
                "S": {
                  "*": {}
                }
              }
            }
          }
        }
      }
    };

    it("should have a valid trie", () => {
      expect(trie.root)
        .to.deep.equal(want);
    });
  });

  describe("valid", () => {
    it("should know CATHARSIS is valid", () => {
      expect(trie.valid("CATHARSIS"))
        .to.equal(true);
    });

    it("should know CATHARSI is invalid", () => {
      expect(trie.valid("CATHARSI"))
        .to.equal(false);
    });

    it("should know CATHARSISE is invalid", () => {
      expect(trie.valid("CATHARSISE"))
        .to.equal(false);
    });

    it("should know CATHETER is invalid", () => {
      expect(trie.valid("CATHETER"))
        .to.equal(false);
    });
  });

  describe("Exceptions", () => {
    it("should reject unordered words", () => {
      function outOfOrder() {
        return new Trie(["AC", "AE", "AD"])
          .root;
      }
      expect(outOfOrder)
        .to.throw("sorted");
    });
  });

  describe("Duplicates OK?", () => {
    it("should ignore duplicates", () => {
      const trie = new Trie(["AAA", "AAA", "AAB", "AAC", "AAC"]);
      const want = {
        "A": {
          "A": {
            "A": {
              "*": {}
            },
            "B": {
              "*": {}
            },
            "C": {
              "*": {}
            }
          }
        }
      };

      expect(trie.root)
        .to.deep.equal(want);
    });
  });

  describe("Encoding", () => {
    it("should correctly encode/decode", () => {
      const words = randomWords(3000);
      const trie = new Trie(words);
      const rep = trie.encode();
      const clone = Trie.decode(rep);
      expect(clone.root)
        .to.deep.equal(trie.root);
    });
  });

});
