"use strict";

module.exports = function(sequelize) {
  return {
    Activity: sequelize.import(__dirname + "/activity.js"),
    Batch: sequelize.import(__dirname + "/batch.js")
  }
}

