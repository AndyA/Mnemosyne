"use strict";

const Indexer = require("lib/js/tools/indexer");
const sorter = require("lib/js/tools/sorter");

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

  clone() {
    return new Trove(this.rows.slice(0));
  }

  sort(...keys) {
    // Clear MV indexes because their ordering depends on sort. Unique
    // indexes are fine - they are ignorant of ordering

    this.indexes = {};
    this.rows.sort(sorter(keys));
    return this;
  }

  sorted(...keys) {
    return this.clone().sort(...keys);
  }
}

module.exports = Trove;
