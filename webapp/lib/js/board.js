const MW = require("mixwith");

const BoardView = require("./board-view")
const Transform = require("./transform");
const Generation = require("./mixin/generation");

class Cell extends MW.mix(Object)
  .with(Generation) {
    constructor(board, tile = null, special = []) {
      super();
      this.board = board;
      this.tile = tile;
      this.special = special;
    }

    get age() {
      return this.board.generation - this.generation;
    }
  }

class Board extends MW.mix(Object)
  .with(Generation) {
    constructor(opt) {
      super();
      Object.assign(this, {
        width: 15,
        height: 15,
      }, opt);

      if (!this.board)
        this.clear();
    }

    _emptyBoard() {
      let board = [];
      for (let y = 0; y < this.height; y++) {
        let row = [];
        for (let x = 0; x < this.width; x++)
          row.push(new Cell(this));
        board.push(row);
      }
      return board;
    }

    clear() {
      this.board = this._emptyBoard();
    }

    get used() {
      let count = 0;
      for (const row of this.board || [])
        for (const cell of row)
          if (cell.tile) count++;
      return count;
    }

    get size() {
      return this.width * this.height;
    }

    get free() {
      return this.size - this.used;
    }

    cell(x, y) {
      if (x < 0 || x >= this.width || y < 0 || y >= this.height)
        throw new Error("Board coordinates out of range");
      return this.board[y][x];
    }

    view(x, y, dir) {
      return new BoardView(this, new Transform(x, y, dir));
    }

    eachRow(func) {
      for (let y = 0; y < this.height; y++)
        func(this.board[y], y);
    }

    each(func) {
      this.eachRow((row, y) => {
        for (let x = 0; x < this.width; x++)
          func(row[x], x, y);
      })
    }

    get centre() {
      return [this.width, this.height].map(x => Math.floor(x / 2));
    }

    words(dir) {
      let words = [];
      this.each((cell, x, y) => {
        if (!cell.tile) return;
        for (const d of dir) {
          const v = this.view(x, y, d);
          const word = v.word;
          if (word.length > 1)
            words.push(word);
        }
      });
      return words;
    }

    toString() {
      // Wildcards not working...
      return this.board.map(row => {
          return row.map(cell => cell.tile ? cell.tile.letter : " ")
            .join(" | ")
        })
        .join("\n");
    }
  }

module.exports = Board;
