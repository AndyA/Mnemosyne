"use strict";

const MW = require("mixwith");

const Programme = MW.Mixin(superclass => class extends superclass {

  async loadAllBroadcasts(prog) {
    return this.loadView("main", "broadcastsByEpisode", {
      key: prog.episode._id, 
      reduce: false,
      include_docs: true,
      stale: "update_after"
    });
  }

}
);

module.exports = Programme;

