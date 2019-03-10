"use strict";

const Indexer = require("lib/js/tools/indexer");
const sorter = require("lib/js/tools/sorter");

class Trove {
  constructor(rows) {
    this._rows = rows;
    this.uniqueIndexes = {};
    this.indexes = {};
  }

  getUniqueIndex(field) {
    if (this.uniqueIndexes.hasOwnProperty(field))
      return this.uniqueIndexes[field];
    return this.uniqueIndexes[field] = Indexer.uniqueByKey(this._rows, field);
  }

  getIndex(field) {
    if (this.indexes.hasOwnProperty(field))
      return this.indexes[field];
    return this.indexes[field] = Indexer.allByKey(this._rows, field);
  }

  find(field, value) {
    return (this.getUniqueIndex(field))[value];
  }

  findAll(field, value) {
    return (this.getIndex(field))[value] || [];
  }

  clone() {
    return new Trove(this._rows.slice(0));
  }

  _clearIndexes() {
    this.indexes = {};
    this.uniqueIndexes = {};
    return this;
  }

  set rows(rows) {
    this._rows = rows;
    return this._clearIndexes();
  }

  get rows() {
    return this._rows;
  }

  append(rows) {
    Array.prototype.push.apply(this._rows, rows);
    return this._clearIndexes();
  }

  sort(...keys) {
    // Clear MV indexes because their ordering depends on sort. Unique
    // indexes are fine - they are ignorant of ordering
    this.indexes = {};
    this._rows.sort(sorter(keys));
    return this;
  }

  sorted(...keys) {
    return this.clone().sort(...keys);
  }

  get singleton() {
    if (this._rows.length > 1)
      throw new Error("Trove is not a singleton");
    return this._rows[0];
  }
}

module.exports = Trove;
