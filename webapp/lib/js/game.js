const _ = require("lodash")
const MW = require("mixwith");

const Player = require("./player")
const HighestScore = require("./strategy/highest-score");
const Generation = require("./mixin/generation");

class Game extends MW.mix(Object)
  .with(Generation) {
    constructor(opt) {
      super();
      Object.assign(this, {
        players: 2,
        next: 0,
        skipped: 0
      }, opt);

      if (!this.rules)
        throw new Error("Missing option: rules");
      if (!this.trie)
        throw new Error("Missing option: trie");

      this._init();
    }

    _makePlayers(n) {
      let pl = [];
      for (let pn = 1; pn <= n; pn++) {
        let player = new Player({
          name: "Player " + pn,
          strategy: new HighestScore
        });
        pl.push(player);
      }
      return pl;
    }

    _init() {
      this.board = this.board || this.rules.makeBoard();
      this.bag = this.bag || this.rules.makeBag();

      if (_.isNumber(this.players))
        this.players = this._makePlayers(this.players);
      if (!_.isArray(this.players))
        throw new Error("players must be a number or an array of players");

      for (const pl of this.players)
        this.fillTray(pl);
    }

    get canPlay() {
      if (this.skipped >= this.players.length)
        return false;
      for (const p of this.players)
        if (p.tray.size === 0)
          return false;
      return true;
    }

    startMove() {
      this.currentPlayer = this.players[this.next++];
      if (this.next == this.players.length)
        this.next = 0;
      // Bump global generation
      this.nextGeneration();
      this.skipped++; // in case we don't play
      return this.currentPlayer;
    }

    fillTray(player) {
      player.tray.fillFrom(this.bag, this.rules.traySize);
    }

    sanityCheck() {
      const words = this.board.words(this.rules.direction);
      const invalid = words.filter(w => !this.trie.valid(w));
      if (invalid.length)
        throw new Error("Illegal words: " + invalid.join(", "));
    }

    endMove() {
      this.skipped = 0;
      this.fillTray(this.currentPlayer);
      this.touch();
      this.sanityCheck();
    }

    get words() {
      return this.board.words(this.rules.direction);
    }
  }

module.exports = Game;
