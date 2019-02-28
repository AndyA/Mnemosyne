"use strict";

const moment = require("moment");

moment.fn.dbFormat = function() {
  return this.format("YYYY-MM-DD[T]HH:mm:ss[Z]");
}

moment.fn.shortTime = function() {
  return this.format("HH:mm");
}

moment.fn.dayName = function() {
  return this.format("ddd");
}
