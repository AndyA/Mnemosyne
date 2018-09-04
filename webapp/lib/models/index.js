"use strict";

module.exports = function(sequelize) {
  return {
    Activity: sequelize.import(__dirname + "/activity.js"),
    ActivityHWM: sequelize.import(__dirname + "/activity_hwm.js"),
    Batch: sequelize.import(__dirname + "/batch.js")
  }
}

