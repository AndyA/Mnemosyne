"use strict";

module.exports = exports = {
  webroot: "www",
  less: "webapp/app/**/*.less",
  less_libs: [
    "webapp/web/less"
  ],
  js: "webapp/app/**/*.{js,jsx}",
  js_libs: ["webapp/lib", "webapp/srv", "build/js"],
  test: "test/**/*.js"
}
