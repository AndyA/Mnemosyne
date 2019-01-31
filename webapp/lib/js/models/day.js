"use strict";

module.exports = function(sequelize, DataTypes) {

  const schema = {
    day: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true
    },
    episode_state: {
      type: DataTypes.ENUM("pending", "complete"),
      defaultValue: "pending"
    },
    service_state: {
      type: DataTypes.ENUM("pending", "complete"),
      defaultValue: "pending"
    }
  };

  const Day = sequelize.define("day", schema, {
    tableName: "mnemosyne_pips_day",
    indexes: [{
      fields: ["episode_state"]
    }, {
      fields: ["service_state"]
    }]
  });

  return Day;
};



