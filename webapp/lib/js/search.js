const _ = require("lodash");

const makeTile = require("./tile")
  .makeTile;

class SearchPath {
  constructor(view, nd, parent, step, length) {
    this.view = view;
    this.nd = nd;
    this.parent = parent;
    this.step = step;
    this.length = length || 0;
  }

  advance(step) {
    const lt = step.letter;
    if (!lt) throw new Error("No letter defined in step");
    if (this.length > this.view.maxX)
      throw new Error(`length: ${this.length}, max: ${this.view.maxX}`);
    const next = this.nd[lt];
    if (!next) return null;
    return new SearchPath(this.view, next, this, step, this.length + 1);
  }

  skip() {
    let sp = this;
    const max = this.view.maxX;
    for (let x = this.length; x <= max; x++) {
      const tile = this.view.tile(x, 0);
      if (!tile) break;
      const next = sp.advance({
        tile,
        letter: tile.letter
      })
      if (!next) break;
      sp = next;
    }
    return sp;
  }

  advanceAndSkip(step) {
    let sp = this.advance(step);
    if (!sp) return null;
    return sp.skip();
  }

  get terminal() {
    return this.nd["*"] &&
      (this.length > this.view.maxX || !this.view.tile(this.length, 0));
  }

  get validLetters() {
    return this._vl = this._vl || Object.keys(this.nd)
      .filter(x => x !== "*")
      .sort();
  }

  flatten() {
    let path = this.parent ? this.parent.flatten() : [];
    if (this.step)
      path.push(this.step);
    return path;
  }

  get path() {
    return this._path = this._path || this.flatten();
  }

  get word() {
    return this._word = this._word || this.path.map(p => p.letter)
      .join("");
  }

  // Gather score information for this match
  _calculateScore(depth) {
    const path = this.path;

    let wordMultiplier = 1;
    let score = 0;
    let crossScore = 0;

    const max = this.view.maxX;
    for (const x in path) {
      const cell = this.view.cell(x, 0);
      const tile = path[x].tile;
      let letterScore = tile.score;

      // Multipliers only apply to empty cells
      if (!cell.tile) {
        for (const spec of cell.special) {
          switch (spec.scope) {
            case "letter":
              letterScore *= spec.multiplier;
              break;
            case "word":
              wordMultiplier *= spec.multiplier;
              break;
            default:
              throw new Error("Bad special rule scope");
          }
        }
      }

      score += letterScore;

      // Add scores for cross words
      const cross = path[x].cross;
      if (cross)
        crossScore += cross._calculateScore(depth + 1);
    }

    return score * wordMultiplier + crossScore;
  }

  get score() {
    return this._score = this._score || this._calculateScore(0);
  }

  toString() {
    const path = this.path;
    let desc = [];
    let cross = [];
    for (const x in path) {
      const pe = path[x];
      const [cx, cy] = this.view.xy(x, 0);
      desc.push(`[${cx}, ${cy}, ${pe.letter}, ` +
        `${pe.bagPos === undefined ? "" : pe.bagPos}]`);
      if (pe.cross)
        cross.push(pe.cross.toString());
    }
    let rep = desc.join(", ");
    if (cross.length) rep += " cross: " + cross.join(", ");
    return "(" + rep + ")";
  }
}

class Search {
  constructor(trie, view, bag) {
    this.trie = trie;
    this.view = view;
    this.bag = this._tiles(bag);
    this._cp = {};
  }

  _tiles(obj) {
    if (_.isString(obj))
      return this._tiles(obj.split(""));
    if (!_.isArray(obj))
      throw new Error("Need a string or an array");
    return obj.map(x => makeTile(x));
  }

  _hasCrossWord(view, x) {
    return (view.minY < 0 && view.tile(x, -1)) ||
      (view.maxY > 0 && view.tile(x, 1));
  }

  _makeCrossPath(view, x) {
    if (!this._hasCrossWord(view, x))
      return null;

    const cv = view.recentre(x, 0)
      .flip()
      .moveLeft();
    return new SearchPath(cv, this.trie.root)
      .skip();
  }

  _crossPath(x) {
    let cp = this._cp;
    if (cp.hasOwnProperty(x)) return cp[x];
    return cp[x] = this._makeCrossPath(this.view, x);
  }

  _match(sp, bag, cb) {
    if (!sp) return;

    const x = sp.length;
    const view = sp.view;

    // Skip over any existing tile
    if (view) {
      const max = view.maxX;
      if (x > max)
        return;

      if (x < max) {
        const tile = view.tile(x, 0);
        if (tile) {
          this._match(sp.advance({
              tile: tile,
              letter: tile.letter
            }),
            bag, cb);
          return;
        }
      }
    }

    // Got a match?
    if (sp.terminal)
      cb(sp);

    // Check the bag
    let seen = {};
    const cp = this._crossPath(x);

    for (let bagPos = 0; bagPos < bag.length; bagPos++) {
      const tile = bag[bagPos];
      const letter = tile.matchLetter;

      // Only process each letter once
      if (seen[letter]) continue;
      seen[letter] = true;

      // Expand wildcard
      const letters = letter === "*" ? sp.validLetters : [letter];

      let nextBag = null; // lazily created

      for (let lt of letters) {
        let nextTile = {
          letter: lt,
          tile,
          bagPos
        };

        // Match cross word
        if (cp) {
          let ncp = cp.advanceAndSkip({
            letter: lt,
            tile
          });
          if (!ncp || !ncp.terminal) continue;
          nextTile.cross = ncp;
        }

        const nextPath = sp.advance(nextTile);
        if (!nextPath) continue;

        if (!nextBag) {
          nextBag = bag.slice();
          nextBag.splice(bagPos, 1);
        }

        this._match(nextPath, nextBag, cb);
      }
    }
  }

  match(cb) {
    this._match(new SearchPath(this.view, this.trie.root),
      this.bag, cb);
  }

  matches() {
    let m = [];
    this.match(match => {
      m.push(match);
    });
    return m;
  }
}

module.exports = Search;
