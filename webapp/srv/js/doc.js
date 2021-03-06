"use strict";

const mds = require("markdown-serve");
const moment = require("moment");
const Handlebars = require("handlebars");

module.exports = mds.middleware({
  rootDirectory: "doc",
  view: "doc",
  resolverOptions: {
    defaultPageName: "README"
  },
  preParse: function(mdf) {
    mdf.meta = mdf.meta || {
      title: "Untitled"
    };

    return {
      title: mdf.meta.title || "Untitled",
      markdown: new Handlebars.SafeString(mdf.parseContent()),
      created: moment(mdf.created).format("LLL"),
      modified: moment(mdf.modified).format("LLL")
    };
  }
});
