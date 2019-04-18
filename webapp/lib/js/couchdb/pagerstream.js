"use strict";

const stream = require('stream');

// Convert a pager into a readable stream

class PagerStream extends stream.Readable {
  constructor(pager) {
    super({
      highWaterMark: pager.pageSize,
      objectMode: true
    });
    this.pager = pager;
  }

  _read(size) {
    this.pager.nextPage().then(data => {
      const rows = data.rows;
      if (rows.length === 0) {
        this.push(null);
        return;
      }
      for (const row of rows)
        this.push(row);
    });
  }
}

module.exports = PagerStream;
