"use strict";

const MW = require("mixwith");

const Programme = MW.Mixin(superclass => class extends superclass {

  async loadAllBroadcasts(prog) {
    let broadcasts = await this.loadView("broadcastsByEpisode", {
      key: prog.episode._id,
      reduce: false,
      include_docs: true
    });

    let thisOne = broadcasts.find("broadcastID", prog.broadcastID);
    thisOne.current = true;

    return broadcasts.sorted("txTime", "serviceName");
  }

}
);

module.exports = Programme;

