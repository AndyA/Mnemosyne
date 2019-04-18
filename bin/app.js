"use strict";

require("../webapp/use");

const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mds = require("markdown-serve");

const WEBROOT = "www";
const app = express();

app.engine(".hbs", exphbs({
  defaultLayout: "main",
  extname: ".hbs"
}));

app.set("view engine", ".hbs");

// Our Handlebars extensions
require("srv/js/handlebars");

app.use(bodyParser.json());

app.use("/db", require("srv/js/couch-proxy.js"));
app.use("/doc", require("srv/js/doc.js"));
app.use(require("srv/js/views.js"));

app.use(express.static(WEBROOT));

app.listen(31792);
