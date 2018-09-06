"use strict";

var express = require("express");
var bodyParser = require("body-parser");

// Handlebars helpers
//require("../webapp/lib/js/srv/hb-helpers/config.js");

var WEBROOT = "www";
var app = express();

app.use(bodyParser.json());

app.use(require("../webapp/srv/js/views.js"));
app.use(require("../webapp/srv/js/api.js"));

app.use(express.static(WEBROOT));

app.listen(31792);
