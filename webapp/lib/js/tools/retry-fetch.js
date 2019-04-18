"use strict";

const fetch = require("node-fetch");
const Promise = require("bluebird");

function retryFetch(url, opt) {
  const init = Object.assign({}, {
    retry: 8,
    delay: 1000,
    backOff: 3
  }, opt || {});

  if (init.retry <= 0)
    throw new Error("Maximum number of retries reached");

  function scheduleNext() {
    const delay = init.delay;
    init.retry--;
    init.delay *= init.backOff;
    console.log("Waiting " + (delay / 1000) + "s");
    return Promise.delay(delay).then(() => {
      return retryFetch(url, init)
    });
  }

  console.log("FETCH " + url);
  return fetch(url, init).then(res => {
    console.log(res.status + " " + res.statusText);
    if (res.ok) return res;
    return scheduleNext();
  }).catch(e => {
    console.log(e);
    return scheduleNext();
  });
}

module.exports = retryFetch;
