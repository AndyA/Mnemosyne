"use strict";

const moment = require("moment");

moment.fn.dbFormat = function() {
  return this.format("YYYY-MM-DD[T]HH:mm:ss[Z]");
}
