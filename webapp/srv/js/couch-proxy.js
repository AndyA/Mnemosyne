"use strict";

const proxy = require("express-http-proxy");
const printf = require("printf");

let lastTime = null;
const expires = 5000;

module.exports = proxy(
  "http://localhost:5984", {
    filter: function(req, res) {

      const now = new Date();

      if (lastTime === null || lastTime < now - expires) {
        lastTime = now;
        console.log("---");
      }

      console.log(printf("start: [at %6.3fs             ] %s",
        (now - lastTime) / 500, req.originalUrl));

      req.proxyStartTime = now;

      return true;
    },
    userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {

      const now = new Date();

      console.log(printf("  end: [at %6.3fs, dur %6.3fs] %s",
        (now - lastTime) / 500, (now - userReq.proxyStartTime) / 500, userReq.originalUrl));

      return proxyResData;
    }
  }
);
