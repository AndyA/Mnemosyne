"use strict";

module.exports = {
  comment: {
    child_of: {
      edit: "edit"
    },
    order: "+when",
    pkey: "uuid",
    plural: "comments",
    table: "fenchurch_comment"
  },
  contributor: {
    child_of: {
      programme: "_parent"
    },
    order: "+index",
    plural: "contributors",
    table: "mnemosyne_contributors"
  },
  edit: {
    json: ["data"],
    pkey: "uuid",
    plural: "edits",
    table: "fenchurch_edit"
  },
  edit_digest: {
    pkey: "uuid",
    table: "fenchurch_edit_digest"
  },
  error: {
    json: ["request"],
    pkey: "uuid",
    plural: "errors",
    table: "mnemosyne_errorlog"
  },
  extra: {
    child_of: {
      issue: "_parent",
      programme: "_parent",
      listing: "_parent",
      service: "_parent"
    },
    json: ["data"],
    order: "+index",
    pkey: "_uuid",
    plural: "extras",
    table: "mnemosyne_extra"
  },
  issue: {
    pkey: "_uuid",
    plural: "issues",
    table: "mnemosyne_issues"
  },
  listing: {
    pkey: "_uuid",
    plural: "listings",
    table: "mnemosyne_listings_v2"
  },
  ping: {
    json: ["path", "status"],
    pkey: "origin_node",
    plural: "pings",
    table: "fenchurch_ping"
  },
  programme: {
    options: {
      ignore_extra_columns: 1
    },
    pkey: "_uuid",
    plural: "programmes",
    table: "mnemosyne_programmes_v2"
  },
  related: {
    child_of: {
      programme: "_parent"
    },
    pkey: "_uuid",
    table: "mnemosyne_related_merged"
  },
  service: {
    pkey: "_uuid",
    plural: "services",
    table: "mnemosyne_services"
  },
  version: {
    child_of: {
      edit: "object",
      error: "object",
      extra: "object",
      issue: "object",
      listing: "object",
      programme: "object",
      service: "object"
    },
    json: ["old_data", "new_data"],
    order: "+sequence",
    pkey: "uuid",
    plural: "versions",
    table: "fenchurch_versions"
  }
}
