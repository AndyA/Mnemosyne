"use strict";

const stream = require("stream");

class G2TroveTransform extends stream.Transform {
  constructor(worker) {
    super({
      objectMode: true
    });
    this.worker = worker;
  }

  _transform(trove, encoding, callback) {
    this.worker(trove)
      .then(t => {
        this.push(trove);
        callback()
      })
      .catch(e => callback(e));
  }
}

module.exports = G2TroveTransform;
