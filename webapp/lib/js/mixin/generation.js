"use strict";

const MW = require("mixwith");

// Global generation number
let _global_generation = 0;

const Generation = MW.Mixin(superclass => class extends superclass {
  get globalGeneration() {
    return _global_generation;
  }

  nextGeneration() {
    return ++_global_generation;
  }

  get generation() {
    return this._generation = this._generation || 0;
  }

  touch() {
    return this._generation = this.globalGeneration;
  }
});

module.exports = Generation;
