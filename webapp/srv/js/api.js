"use strict";

var express = require("express");
var app = express();

app.post("/api/wp/push", function(req, res) {
  console.log(JSON.stringify(req.body, null, 2));
  res.json({
    status: "OK"
  });
});

module.exports = app;
