"use strict";

const Indexer = require("lib/js/tools/indexer");

class Trove {
  constructor(rows) {
    this.rows = rows;
    this.uniqueIndexes = {};
    this.indexes = {};
  }

  getUniqueIndex(field) {
    if (this.uniqueIndexes.hasOwnProperty(field))
      return this.uniqueIndexes[field];
    return this.uniqueIndexes[field] = Indexer.uniqueByKey(this.rows, field);
  }

  getIndex(field) {
    if (this.indexes.hasOwnProperty(field))
      return this.indexes[field];
    return this.indexes[field] = Indexer.allByKey(this.rows, field);
  }

  find(field, value) {
    return (this.getUniqueIndex(field))[value];
  }

  findAll(field, value) {
    return (this.getIndex(field))[value] || [];
  }
}

module.exports = Trove;
