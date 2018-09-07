"use strict";

module.exports = function(sequelize) {
  return {
    Activity: sequelize.import(__dirname + "/activity.js"),
    Batch: sequelize.import(__dirname + "/batch.js"),
    Event: sequelize.import(__dirname + "/event.js"),
    HashIndex: sequelize.import(__dirname + "/hash-index.js"),
  }
}

