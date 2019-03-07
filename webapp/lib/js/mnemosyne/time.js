"use strict";

const moment = require("moment");

const storeFormat = "YYYY-MM-DD[T]HH:mm:ss[Z]";

moment.fn.toStore = function() {
  return this.format(storeFormat);
}

moment.fromStore = function(dt) {
  const m = moment.utc(dt, storeFormat, true);
  if (!m.isValid())
    throw new Error("Invalid store time: " + dt);
  return m;
}
