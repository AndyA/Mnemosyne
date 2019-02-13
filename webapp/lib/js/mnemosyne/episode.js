"use strict";

const MnemosyneDocument = require("./document");
const Pluck = require("lib/js/tools/pluck");
const Indexer = require("lib/js/tools/indexer");

class MnemosyneEpisode extends MnemosyneDocument {
  static get table() {
    return "mnemosyne_episode";
  }
}

MnemosyneEpisode
  .jpAttr("title", ["$.episode.title['$']", "$.containersTitle"])
  .jpAttr("containersTitle", "$.episode.containers_title['$']")
  .jpAttr("presentationTitle", "$.episode.presentation_title['$']")
  .jpAttr("synopses", {
    paths: "$.episode.synopses.synopsis[*]",
    array: true
  })
  .lazyAttr("synopsis", function() {
    return Pluck.pluckValues(Indexer.uniqueByKey(this.synopses, "length"), "$['$']");
  })
  .jpAttr("shortSynopsis", [
    "$.synopsis.short",
    "$.synopsis.medium",
    "$.synopsis.long"
  ])
  .jpAttr("mediumSynopsis", [
    "$.synopsis.medium",
    "$.synopsis.short",
    "$.synopsis.long"
  ])
  .jpAttr("longSynopsis", [
    "$.synopsis.long",
    "$.synopsis.medium",
    "$.synopsis.short"
  ]);

module.exports = MnemosyneEpisode;

