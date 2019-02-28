"use strict";

const Handlebars = require("handlebars");

Handlebars.registerHelper("shortTime", function(m) {
  return m.shortTime();
});

Handlebars.registerHelper("dayName", function(m) {
  return m.dayName();
});

Handlebars.registerHelper("dayNumber", function(m) {
  return m.date();
});

Handlebars.registerHelper("toJSON", function(object) {
  return new Handlebars.SafeString(JSON.stringify(object));
});

Handlebars.registerHelper("toPrettyJSON", function(object) {
  return new Handlebars.SafeString(JSON.stringify(object, null, 2));
});
