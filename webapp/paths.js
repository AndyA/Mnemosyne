"use strict";

module.exports = exports = {
  webroot: "www",
  sass: "webapp/app/**/*.{sass,scss}",
  sass_libs: [
    "webapp/web/sass",
    "node_modules"
  ],
  js: "webapp/app/**/*.{js,jsx}",
  js_libs: ["webapp/lib/js", "webapp/web/js", "build/js"],
  test: "test/**/*.js"
}
