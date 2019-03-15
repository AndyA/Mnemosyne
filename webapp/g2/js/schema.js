"use strict";

const assert = require("assert");

class G2Schema {
  constructor(schema) {
    // Deep clone
    this.schema = JSON.parse(JSON.stringify(schema));
    this.addHasRelations();
  }

  addHasRelations() {
    for (const [kind, info] of Object.entries(this.schema)) {
      if (info.child_of) {
        for (const [parent, column] of Object.entries(info.child_of)) {
          let parentInfo = this.infoFor(parent);
          (parentInfo.has = parentInfo.has || {})[kind] = column;
        }
      }
    }
  }

  infoFor(kind) {
    assert(this.schema[kind], kind + " unknown");
    return this.schema[kind];
  }

  getRoots() {
    return Object.entries(this.schema)
      .filter(([kind, info]) => !info.child_of && info.pkey)
      .map(([kind, info]) => kind)
      .sort();
  }
}

module.exports = G2Schema;
