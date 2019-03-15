"use strict";

const G2TroveTransform = require("./trove-transform");

class G2TroveExpander extends G2TroveTransform {
  constructor() {
    super(trove => trove.expandAllChildren());
  }
}

module.exports = G2TroveExpander;
