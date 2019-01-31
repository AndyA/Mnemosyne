"use strict";

module.exports = function(sequelize, DataTypes) {

  const schema = {
    uuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    ID: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("OK", "NOT FOUND", "ERROR"),
      allowNull: false
    },
    raw: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  };

  const Episode = sequelize.define("episode", schema, {
    tableName: "mnemosyne_episode",
    indexes: [{
      unique: true,
      fields: ["ID"]
    }, {
      fields: ["status"]
    }]
  });

  return Episode;
};


