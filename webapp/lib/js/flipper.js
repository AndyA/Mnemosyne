class Flipper {
  constructor(flips) {
    this.flips = flips || [];
  }

  _flip(items, ff) {
    let out = [];
    for (const i of items) {
      out.push(i);
      out.push(ff(...i));
    }
    return out;
  }

  flip(args, func) {
    let work = [args];
    for (const flip of this.flips)
      work = this._flip(work, flip);
    let seen = {};
    for (const a of work) {
      const key = JSON.stringify(a);
      if (seen[key]) continue;
      seen[key] = true;
      func(...a)
    }
  }

}

module.exports = Flipper;
