"use strict";

const Handlebars = require("handlebars");

Handlebars.registerHelper("shortTime", function(m) {
  return m.format("HH:mm");
});
