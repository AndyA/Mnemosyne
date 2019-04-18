"use strict";

const Promise = require("bluebird");

class Unchunk {
  constructor(cb) {
    this.cb = cb;
    this.queue = [];
    this.done = false;
    this.fetcher = null;
  }

  next() {
    if (this.queue.length)
      return this.queue.shift();

    if (this.done)
      return null;

    if (!this.fetcher)
      this.fetcher = Promise.resolve(this.cb()).then(q => {
        if (q.length === 0)
          this.done = true;
        this.queue = q;
        this.fetcher = null;
      });

    return this.fetcher.then(() => this.next());
  }
}

module.exports = Unchunk;
