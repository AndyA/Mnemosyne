const _ = require("lodash");
const MW = require("mixwith");
const Generation = require("./mixin/generation");

class Bag extends MW.mix(Object)
  .with(Generation) {
    constructor(tiles) {
      super();
      this.tiles = tiles || [];
    }

    get size() {
      return this.tiles.length;
    }

    add(...tiles) {
      this.touch();
      Array.prototype.push.apply(this.tiles, _.flattenDeep(tiles));
    }

    pull(idx) {
      this.touch();
      return _.pullAt(this.tiles, idx);
    }

    take(n) {
      const idx = _.shuffle(_.range(this.size));
      return this.pull(idx.slice(0, n));
    }

    fillFrom(bag, n) {
      const need = n - this.size;
      this.add(bag.take(need));
    }

    toString() {
      return this.tiles.map(x => x.toString())
        .join(" | ");
    }
  }

module.exports = Bag
