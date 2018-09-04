"use strict";

const gulp = require("gulp");
const shell = require("gulp-shell");
const colors = require("ansi-colors");
const log = require("fancy-log");
const notify = require("gulp-notify");
const uglify = require("gulp-uglify");
const less = require("gulp-less");
const gls = require("gulp-live-server");
const cleanCSS = require("less-plugin-clean-css");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const transform = require("vinyl-transform");
const through2 = require("through2");
const sourcemaps = require("gulp-sourcemaps");
const exorcist = require("exorcist");
const watchify = require("watchify");
const Q = require("q");
const prettyHrtime = require("pretty-hrtime");
const path = require("path");
const YAML = require('yamljs');
const browserSync = require('browser-sync')
  .create();
const mocha = require("gulp-mocha");
const handlebars = require('gulp-handlebars');
const defineModule = require('gulp-define-module');

const paths = require("./webapp/paths");
const appConfig = require("./webapp/config");

const configFile = "config.yml";

function flatten() {
  var out = [];
  for (var i = 0; i < arguments.length; i++) {
    var elt = arguments[i];
    if (Array.isArray(elt))
      Array.prototype.push.apply(out, elt);
    else
      out.push(elt);
  }
  return out;
}

gulp.task("browser-sync", function() {
  browserSync.init(appConfig.bs);

  gulp.watch([
      "lib/**/*.pm",
      "components/*/lib/**.pm",
      "config.yml",
    ])
    .on("change", function() {
      setTimeout(browserSync.reload, 3000);
    });

  gulp.watch([
      "views/**/*.tt",
    ])
    .on("change", browserSync.reload);
});

gulp.task("less", function() {
  const config = YAML.load(configFile);

  var cleanCSSPlugin = new cleanCSS({
    advanced: true
  });

  var l = less({
    style: "compressed",
    paths: paths.less_libs,
    plugins: [cleanCSSPlugin],
  });

  l.on("error", function(e) {
    log(e);
    this.emit("end");
  });

  return gulp.src(paths.less)
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(l)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.webroot))
    .pipe(browserSync.stream());
});

gulp.task("watchless", ["less"], function() {
  var watchFiles = flatten(configFile, paths.less, paths.less_libs.map(
    function(dir) {
      return path.join(dir, "**", "*.less")
    }));
  gulp.watch(watchFiles, ["less"]);
});

gulp.task('templates', function() {
  gulp.src('webapp/templates/**/*.hbs')
    .pipe(handlebars())
    .pipe(defineModule('es6'))
    .pipe(gulp.dest('build/js/templates'));
});

gulp.task('watchtemplates', function() {
  gulp.watch("webapp/templates/**/*.hbs", ["templates"]);
});

function makeBundler(watch, mode) {
  var promises = [];

  var src = gulp.src(paths.js, {
    read: false
  });

  src.pipe(through2.obj(function(file, enc, next) {
      var bundler = browserify(file.path, {
        debug: mode === "dev",
        cache: {},
        packageCache: {},
        fullPaths: true,
        paths: paths.js_libs
      });

      bundler.transform("babelify", {
        presets: ["react"]
      });

      if (mode === "live") {
        bundler.transform("uglifyify", {
          global: true
        });
      }

      var bundle = function() {
        var startTime = process.hrtime();
        log("Starting " + mode + " bundler for", colors.cyan(file.relative));
        return bundler.bundle()
          .on("error", log)
          .on("end", function() {
            var endTime = process.hrtime(startTime);
            log("Finished " + mode + " bundler for", colors.cyan(file.relative),
              "after", colors.magenta(prettyHrtime(endTime)));
          })
          .pipe(exorcist(path.join(paths.webroot, file.relative + ".map")))
          .pipe(source(file.relative))
          .pipe(gulp.dest(paths.webroot))
          .pipe(browserSync.stream());

      }

      if (watch) {
        bundler.plugin(watchify, {
          ignoreWatch: true
        });
        bundler.on('update', bundle);
      }

      var def = Q.defer();
      bundle()
        .on("end", def.resolve.bind(def));
      promises.push(def.promise);

      next(null, file);
    }))
    .on("data", function() {})
    .on("end", function() {});

  return Q.all(promises);
}

gulp.task("unit", function() {
  return gulp.src(paths.test)
    .pipe(mocha({
      reporter: "spec"
    }));
});

gulp.task('tdd', ["test"], function() {
  var watchFiles = flatten("build/js/**/*.js", paths.test, paths.js_libs.map(
    function(dir) {
      return path.join(dir, "**", "*.js")
    }));
  return gulp.watch(watchFiles, ['test']);
})

gulp.task("watchify", ["templates"], function() {
  return makeBundler(true, "dev");
});

gulp.task("browserify-live", ["templates"], function() {
  return makeBundler(false, "live");
});

gulp.task("browserify-dev", ["templates"], function() {
  return makeBundler(false, "dev");
});

gulp.task("server:development", function() {
  const server = gls.new("bin/app.js", {
    env: {
      NODE_ENV: "development"
    }
  });

  server.start();

  gulp.watch([
    "bin/app.js",
    "views/**/*.hbs",
    "webapp/**/*.js",
  ], function() {
    browserSync.reload();
    server.start();
    // server.start.apply(server);
  });

});

gulp.task("build", ["less", "browserify-live"]);
gulp.task("make", ["less", "browserify-dev"]);

gulp.task("watch", [
  "watchless",
  "watchtemplates",
  "watchify",
  "browser-sync",
  "server:development"
]);

gulp.task("test", ["unit"]);
gulp.task("default", ["build"]);
