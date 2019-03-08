"use strict";

const DocPipe = require("lib/js/docpipe");

module.exports = function(dp) {
  dp = dp || new DocPipe();

  dp.addStage((doc, ctx) => {
    if (doc.kind === "broadcast" && doc.broadcastDay === undefined) {
      const tx = jp.value(doc, "$.broadcast.published_time[*]['$'].start");
      if (tx) {
        const broadcastDay = moment.radioTimes(tx).startOf("broadcastDay");
        doc.broadcastDay = broadcastDay.format("YYYY-MM-DD");
        ctx.save();
      }
    }
  });

  dp.addStage((doc, ctx) => {
    if (doc.kind && doc.source === undefined) {
      doc.source = "pips";
      ctx.save();
    }
  });

  return dp;
}
