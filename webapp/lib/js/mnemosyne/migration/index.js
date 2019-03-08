"use strict";

const DocPipe = require("lib/js/docpipe");
const jp = require("jsonpath");
const moment = require("lib/js/bbc/datetime");

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

  dp.addStage((doc, ctx) => {
    if (doc.kind === "broadcast" && doc.serviceName === undefined) {
      const sn = jp.value(doc, "$.broadcast.service[*]['$'].sid");
      if (sn) {
        doc.serviceName = sn;
        ctx.save();
      }
    }
  });

  return dp;
}
