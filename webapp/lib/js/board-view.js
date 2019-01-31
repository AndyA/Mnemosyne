const Transform = require("./transform");

class BoardView {
  constructor(board, trans) {
    const [ox, oy] = trans.origin;

    if (ox < 0 || ox >= board.width ||
      oy < 0 || oy >= board.height)
      throw new Error("View outside board (" +
        `[${ox}, ${oy}] v [${board.width}, ${board.height}])`);

    this.board = board;
    this.trans = trans;
  }

  get bounds() {
    if (this._bounds)
      return this._bounds;
    const inv = this.trans.inverse;
    const b = this.board;
    const bl = inv.xy(0, 0);
    const tr = inv.xy(b.width - 1, b.height - 1);
    return [...bl, ...tr];
  }

  get minX() {
    return this.bounds[0];
  }

  get minY() {
    return this.bounds[1];
  }

  get maxX() {
    return this.bounds[2];
  }

  get maxY() {
    return this.bounds[3];
  }

  get origin() {
    return this.trans.origin;
  }

  xy(x, y) {
    return this.trans.xy(x, y);
  }

  cell(x, y) {
    const [cx, cy] = this.xy(x, y);
    return this.board.cell(cx, cy);
  }

  tile(x, y) {
    return this.cell(x, y)
      .tile;
  }

  recentre(x, y) {
    if (x === 0 && y === 0)
      return this;
    return new BoardView(this.board, this.trans.recentre(x, y));
  }

  flip() {
    return new BoardView(this.board, this.trans.flipped);
  }

  get flipped() {
    return this.flip();
  }

  moveLeft() {
    const min = this.minX;
    let ofs = -1;
    while (ofs >= min && this.tile(ofs, 0)) ofs--;
    return this.recentre(ofs + 1, 0);
  }

  wouldTouch(len) {
    const [xmin, ymin, xmax, ymax] = this.bounds;

    if (len === undefined || len > xmax + 1)
      len = xmax + 1;

    // Is there a tile behind us?
    if (xmin < 0 && this.tile(-1, 0))
      return true;

    // Look along the sides.
    for (let x = 0; x < len; x++) {
      if (ymin < 0 && this.tile(x, -1))
        return true;
      if (ymax > 0 && this.tile(x, 1))
        return true;
    }

    // Is there a tile at the end?
    if (xmax > len && this.tile(len, 0))
      return true;

    return false;
  }

  playPath(path) {
    this.board.touch();
    for (const x in path) {
      const node = path[x];
      const cell = this.cell(x, 0);
      if (!cell.tile) {
        cell.tile = node.tile;
        cell.tile.letter = node.letter;
        cell.touch();
      }
    }
  }

  // Contiguous tiles from the start of the view
  get word() {
    if (this._word !== undefined)
      return this._word;

    const bb = this.bounds;
    if (bb[0] < 0 && this.tile(-1, 0))
      return this._word = "";

    let lt = [];
    for (let x = 0; x <= bb[2]; x++) {
      const tile = this.tile(x, 0);
      if (!tile) break;
      lt.push(tile.letter);
    }
    return this._word = lt.join("");
  }
}

module.exports = BoardView;
