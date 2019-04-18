"use strict";

const express = require("express");

const MnemosyneContext = require("lib/js/mnemosyne/context");
const Promise = require("bluebird");
const moment = require("moment");

const app = express();
const ctx = new MnemosyneContext();

function makeTitle(...parts) {
  return [...parts, "Mnemosyne"].join(" | ");
}

function notFound(res) {
  return res.status(404).render("404", {
    title: makeTitle("Not found")
  });
}

app.get("/", (req, res) => {
  res.render("home", {
    title: makeTitle(),
  });
});

module.exports = app;
