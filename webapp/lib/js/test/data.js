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
    return fs.readdirAsync(path.join(this.root, dir)).then(files => {
      return Promise.all(
        files
          .filter(fn => /\.json$/i.test(fn))
          .map(fn => this.loadData(path.join(dir, fn)))
      );
    });
  }

  loadDataSync(file) {
    return JSON.parse(fs.readFileSync(path.join(this.root, file)));
  }

  loadAllSync(dir) {
    return fs.readdirSync(path.join(this.root, dir))
      .filter(fn => /\.json$/i.test(fn))
      .map(fn => this.loadDataSync(path.join(dir, fn)))
  }
}

module.exports = TestData;
