const MW = require("mixwith");

const Bag = require("./bag")
const Generation = require("./mixin/generation");

class Player extends MW.mix(Object)
  .with(Generation) {
    constructor(opt) {
      super();
      Object.assign(this, {}, opt);
      this.tray = this.tray || new Bag;
      this._score = 0;
    }

    get score() {
      return this._score;
    }

    bumpScore(n) {
      if (n) {
        this.touch();
        this._score += n;
      }
    }
  }

module.exports = Player;
