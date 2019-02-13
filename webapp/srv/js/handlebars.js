"use strict";

const Handlebars = require("handlebars");

Handlebars.registerHelper("shortTime", function(m) {
  return m.shortTime();
});

Handlebars.registerHelper("toJSON", function(object) {
  return new Handlebars.SafeString(JSON.stringify(object));
});
