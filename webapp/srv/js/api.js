"use strict";

var express = require("express");
var app = express();

const MnemosyneMessage = require("../../lib/mnemosyne/message");

app.post("/api/wp/push", function(req, res) {
  const log = MnemosyneMessage.fromLog(req.body);
  //  console.log(log);
  console.log(JSON.stringify(req.body, null, 2));
  res.json({
    status: "OK"
  });
});

module.exports = app;
