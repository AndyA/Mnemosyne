"use strict";

const Promise = require("bluebird");

const path = require("path");
const fs = Promise.promisifyAll(require("fs"));

// Load test data

class TestData {
  constructor(root) {
    this.root = root || "test/data";
  }

  loadData(file) {
    return fs.readFileAsync(path.join(this.root, file)).then(data => JSON.parse(data));
  }

  loadAll(dir) {
    const dirName = path.join(this.root, dir);
    return fs.readdirAsync(dirName).then(files => {
      return Promise.all(
        files
          .filter(fn => /\.json$/i.test(fn))
          .map(fn => this.loadData(path.join(dir, fn)))
      );
    });
  }
}

module.exports = TestData;
