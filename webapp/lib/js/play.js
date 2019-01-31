const ArrayPicker = require("./array-picker");

class Play {
  constructor(turn, view, match) {
    this.turn = turn;
    this.view = view;
    this.match = match;

    const fp = ArrayPicker.reverseIndex(match.path.map(x => x.bagPos));

    this.path = match.path.map((x, i) => {
      x.relBagPos = fp[i];
      x.cell = view.cell(i, 0);
      return x;
    });
  }

  get word() {
    return this.match.word;
  }

  get rules() {
    return this.turn.rules;
  }

  get score() {
    return this._score = this._score ||
      this.match.score + this.rules.computeBonus(this);
  }

  get novel() {
    for (const i of this.match.path)
      if (i.relBagPos !== undefined)
        return true;
    return false;

  }

  get adjoined() {
    for (const i of this.match.path)
      if (i.relBagPos === undefined || i.cross)
        return true;
    return false;
  }

  _takeFromRack() {
    const pick = this.path.map(x => x.relBagPos)
      .filter(x => x !== undefined);
    return this.turn.player.tray.pull(pick);
  }

  commit() {
    this._takeFromRack();
    this.view.playPath(this.path);

    this.turn.player.bumpScore(this.score);
  }
}

module.exports = Play;
