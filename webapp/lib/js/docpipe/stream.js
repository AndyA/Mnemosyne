"use strict";

const stream = require("stream");

class DocPipeStream extends stream.Transform {
  constructor(docPipe, options) {

    const opt = Object.assign({}, {
      highWaterMark: 256,
    }, options || {}, {
      objectMode: true
    })

    super(opt);

    this.docPipe = docPipe;
    this.opt = opt;
  }

  _transform(chunk, encoding, callback) {
    this.docPipe.processDoc(chunk).then(doc => {
      if (doc !== undefined)
        this.push(doc);
      callback();
    });
  }
}

module.exports = DocPipeStream;
