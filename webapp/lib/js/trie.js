const _ = require("lodash");

const makeTile = require("./tile")
  .makeTile;

class Trie {
  constructor(words, root = null) {
    this.words = words;
    this._root = root;
  }

  _trieLevel(lo, hi, rank) {
    const words = this.words;

    let prevLetter, prevPos = lo,
      nd = {};

    for (let pos = lo; pos < hi; pos++) {
      const word = words[pos];
      if (rank <= word.length) {
        const letter = rank == word.length ? "*" : word[rank];
        if (prevLetter === undefined)
          prevLetter = letter;
        if (prevLetter !== letter) {
          if (letter < prevLetter && letter !== "*")
            throw new Error("Words must be sorted");
          nd[prevLetter] = this._trieLevel(prevPos, pos, rank + 1);
          [prevPos, prevLetter] = [pos, letter];
        }
      }
    }

    if (prevLetter !== undefined)
      nd[prevLetter] = this._trieLevel(prevPos, hi, rank + 1);

    return nd;
  }

  get root() {
    return this._root = this._root ||
      this._trieLevel(0, this.words.length, 0);
  }

  _tiles(obj) {
    if (_.isString(obj))
      return this._tiles(obj.split(""));
    if (!_.isArray(obj))
      throw new Error("Need a string or an array");
    return obj.map(x => makeTile(x));
  }

  valid(word) {
    let nd = this.root;
    const tiles = this._tiles(word);
    for (const tile of tiles) {
      const nextNode = nd[tile.letter];
      if (!nextNode) return false;
      nd = nextNode;
    }
    return !!nd["*"];
  }

  encode() {
    let enc = [];

    function encodeNode(nd) {
      for (const lt in nd) {
        enc.push(lt);
        encodeNode(nd[lt]);
      }
      enc.push(".");
    }

    encodeNode(this.root);

    return enc.join("")
      .replace(/\*\./g, "*")
      .replace(/(\.+)/g, (m, p1) => p1.length);
  }

  static decode(rep) {
    let dots = ".";
    let pos = 0;

    const exp = rep.replace(/(\d+)/g, (m, p1) => {
        while (dots.length < p1)
          dots = dots + dots;
        return dots.substr(0, p1);
      })
      .replace(/\*/g, "*.");

    function decodeNode() {
      let nd = {};
      while (pos < exp.length) {
        const lt = exp[pos++];
        if (lt === ".") break;
        nd[lt] = decodeNode();
      }
      return nd;
    }

    return new Trie(null, decodeNode());
  }
}

module.exports = Trie;
