"use strict";

module.exports = {
  blog_link: {
    child_of: {
      issue: "programme",
      programme: "programme"
    },
    order: "blog_id",
    table: "mnemosyne_blog_link"
  },
  comment: {
    child_of: {
      edit: "edit"
    },
    order: "when",
    pkey: "uuid",
    plural: "comments",
    table: "fenchurch_comment"
  },
  contributor: {
    child_of: {
      programme: "_parent"
    },
    order: "index",
    plural: "contributors",
    table: "mnemosyne_contributors"
  },
  coordinate: {
    child_of: {
      programme: "_parent"
    },
    order: "index",
    plural: "coordinates",
    table: "mnemosyne_coordinates"
  },
  edit: {
    json: ["data"],
    pkey: "uuid",
    plural: "edits",
    table: "mnemosyne_edit"
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
      listing: "_parent",
      programme: "_parent",
      service: "_parent"
    },
    json: ["data"],
    order: "index",
    pkey: "_uuid",
    plural: "extras",
    table: "mnemosyne_extra"
  },
  infax: {
    child_of: {
      programme: "uuid"
    },
    pkey: "uuid",
    table: "mnemosyne_infax"
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
  programme: {
    order: "when",
    pkey: "_uuid",
    plural: "programmes",
    table: "mnemosyne_programmes_v2"
  },
  region: {
    pkey: "_uuid",
    plural: "regions",
    table: "mnemosyne_regions"
  },
  region_aliases: {
    child_of: {
      region: "_parent"
    },
    table: "mnemosyne_region_aliases"
  },
  related: {
    child_of: {
      programme: "_parent"
    },
    order: "index",
    pkey: "_uuid",
    table: "mnemosyne_related"
  },
  related_merged: {
    child_of: {
      programme: "_parent"
    },
    order: "_uuid",
    pkey: "_uuid",
    table: "mnemosyne_related_merged"
  },
  related_meta: {
    child_of: {
      related: "_uuid"
    },
    order: "keep",
    pkey: "_uuid",
    table: "mnemosyne_related_meta"
  },
  service: {
    // Disable this because it stops our old versions applying cleanly
    //    json: ["data"],
    pkey: "_uuid",
    plural: "services",
    table: "mnemosyne_services"
  },
  service_aliases: {
    child_of: {
      service: "_parent"
    },
    table: "mnemosyne_service_aliases"
  },
  service_incorporates: {
    child_of: {
      service: "service"
    },
    table: "mnemosyne_service_incorporates"
  },
  table: {
    child_of: {
      programme: "_parent"
    },
    json: ["table"],
    order: "index",
    plural: "tables",
    table: "mnemosyne_tables"
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
    order: "sequence",
    pkey: "uuid",
    plural: "versions",
    table: "fenchurch_versions"
  }
}
