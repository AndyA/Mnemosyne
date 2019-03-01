"use strict";

const Handlebars = require("handlebars");

Handlebars.registerHelper("shortTime", function(m) {
  return m.format("HH:mm");
});

Handlebars.registerHelper("prettyDate", function(m) {
  return m.format("dddd, MMMM Do, YYYY");
});

Handlebars.registerHelper("dateTime", function(m) {
  return m.format("Do MMM YYYY, HH:mm");
});

Handlebars.registerHelper("dayName", function(m) {
  return m.format("ddd");
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

Handlebars.registerHelper("classFlags", function(...flags) {
  return flags
    .filter(f => this[f])
    .join(" ");
});
