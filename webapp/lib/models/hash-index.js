"use strict";

module.exports = function(sequelize, DataTypes) {

  let schema = {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    hash: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    set: {
      type: DataTypes.STRING(80),
      allowNull: false,
      primaryKey: true,
    }
  };

  const HashIndex = sequelize.define("index", schema, {
    tableName: "index",
    timestamps: false,
  });

  return HashIndex;
};

