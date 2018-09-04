"use strict";

const os = require("os");
const merge = require('merge-deep');

function getConfig() {
  const defaultConfig = {
    bs: {
      proxy: "http://localhost:31792"
    }
  };

  const perHostConfig = {
  };

  const host = os.hostname();
  if (perHostConfig.hasOwnProperty(host))
    return merge(defaultConfig, perHostConfig[host]);
  return defaultConfig;
}

module.exports = exports = getConfig();

