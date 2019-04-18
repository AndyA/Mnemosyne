"use strict";

const events = require("../ref/event.js");

events.push({
  meta: ["a", "b", "c"]
});

events.push({
  meta: {
    subject: {
      role: [{
        name: "admin"
      }, {
        name: "author"
      }, {
        name: "editor"
      }, {
        name: "user"
      }]
    }
  }
});

for (const ev of events) {
  jpWalk(ev.meta, "$", function(path, val) {
    console.log(path + " " + val);
  });
  console.log("---");
}

function jpWalk(obj, path, cb) {
  switch (Object.prototype.toString.call(obj)) {
    case "[object Array]":
      var np = path + "[*]";
      for (var i = 0; i < obj.length; i++)
        jpWalk(obj[i], np, cb);
      break;
    case "[object Object]":
      for (var i in obj)
        if (obj.hasOwnProperty(i))
          jpWalk(obj[i], path + "." + i, cb);
      break;
    default:
      cb(path, obj);
      break;
  }
}
