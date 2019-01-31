const Board = require("./board")
const Flipper = require("./flipper")
const Bag = require("./bag")

const {
  Tile,
  WildTile
} = require("./tile");

const defaultRules = {
  tray: {
    size: 7
  },
  board: {
    width: 15,
    height: 15,
    flip: ["x", "y", "diag"],
    direction: [
      "across", "down"
    ],
    special: [{
        multiplier: 2,
        scope: "letter",
        at: [
          [3, 0],
          [6, 2],
          [7, 3],
          [6, 6]
        ]
      },
      {
        multiplier: 3,
        scope: "letter",
        at: [
          [5, 1],
          [5, 5]
        ]
      },
      {
        multiplier: 2,
        scope: "word",
        at: [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4],
          [7, 7]
        ]
      },
      {
        multiplier: 3,
        scope: "word",
        at: [
          [0, 0],
          [7, 0]
        ]
      },
    ],
  },
  letters: {
    count: {
      A: 9,
      B: 2,
      C: 2,
      D: 4,
      E: 12,
      F: 2,
      G: 3,
      H: 2,
      I: 9,
      J: 1,
      K: 1,
      L: 4,
      M: 2,
      N: 6,
      O: 8,
      P: 2,
      Q: 1,
      R: 6,
      S: 4,
      T: 6,
      U: 4,
      V: 2,
      W: 2,
      X: 1,
      Y: 2,
      Z: 1,
      "*": 2,
    },
    score: {
      A: 1,
      B: 3,
      C: 3,
      D: 2,
      E: 1,
      F: 4,
      G: 2,
      H: 4,
      I: 1,
      J: 8,
      K: 5,
      L: 1,
      M: 3,
      N: 1,
      O: 1,
      P: 3,
      Q: 10,
      R: 1,
      S: 1,
      T: 1,
      U: 1,
      V: 4,
      W: 4,
      X: 8,
      Y: 4,
      Z: 10,
    },
  },
  bonus: {
    7: 50
  }
}

class Rules {
  constructor(rules) {
    this.rules = Object.assign({}, defaultRules, rules);
  }

  get traySize() {
    return this.rules.tray.size;
  }

  get direction() {
    return this.rules.board.direction;
  }

  get flipper() {
    if (this._flipper)
      return this._flipper;

    const br = this.rules.board;

    let flip = [];
    for (const f of br.flip) {
      switch (f) {
        case "x":
          flip.push((x, y) => [br.width - 1 - x, y]);
          break;
        case "y":
          flip.push((x, y) => [x, br.height - 1 - y]);
          break;
        case "diag":
          flip.push((x, y) => [y, x]);
          break;
        default:
          throw new Error("Bad flip: " + f);
      }
    }

    return this._flipper = new Flipper(flip);
  }

  makeBoard() {
    const br = this.rules.board;

    var b = new Board({
      width: br.width,
      height: br.height
    });

    // Add special cells
    for (const sp of br.special) {
      for (const at of sp.at) {
        this.flipper.flip(at, (x, y) => {
          var c = b.cell(x, y);
          c.special.push({
            scope: sp.scope,
            multiplier: sp.multiplier
          });
        });
      }
    }

    return b;
  }

  makeBag() {
    const lr = this.rules.letters;
    let pile = [];
    for (const lt of Object.keys(lr.count)) {
      for (let i = 0; i < lr.count[lt]; i++) {
        if (lt === "*")
          pile.push(new WildTile);
        else
          pile.push(new Tile(lt, lr.score[lt]));
      }
    }

    return new Bag(pile);
  }

  letterScore(lt) {
    return this.rules.letters.score[lt] || 0;
  }

  // Visit each potentially playable cell.
  eachValid(board, len, cb) {
    const directions = this.direction;

    function sendCell(x, y, dir) {
      if (x < 0 || y < 0 || directions.indexOf(dir) < 0)
        return;

      if (board.used) {
        const v = board.view(x, y, dir);
        if (!v.wouldTouch(len))
          return;
      }

      cb(x, y, dir);
    }

    // Opening move?
    if (board.used === 0) {
      const [cx, cy] = board.centre;
      for (let ofs = 0; ofs < this.rules.tray.size; ofs++) {
        sendCell(cx - ofs, cy, "across");
        sendCell(cx, cy - ofs, "down");
      }
      return;
    }

    // Regular play
    board.each((cell, x, y) => {
      if (!cell.tile) {
        for (const dir of directions) {
          sendCell(x, y, dir);
        }
      }
    });
  }

  validPlay(board, play) {
    if (!play.novel)
      return false;
    if (board.used)
      return play.adjoined;

    // First move, has to cover cx, cy
    const [cx, cy] = board.centre;

    const v = play.match.view;
    const [x0, y0] = v.xy(0, 0);
    const [x1, y1] = v.xy(play.match.length - 1, 0);

    return x0 <= cx && x1 >= cx && y0 <= cy && y1 >= cy;
  }

  computeBonus(play) {
    const played = play.path.length;
    return (this.rules.bonus[played] || 0);
  }
}

module.exports = Rules;
