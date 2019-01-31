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
    service: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    episode: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    version: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    service_id: {
      type: DataTypes.STRING(60),
      allowNull: false
    },
    episode_id: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    version_id: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    when: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    day: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    raw: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  };

  const Broadcast = sequelize.define("broadcast", schema, {
    tableName: "mnemosyne_broadcast",
    indexes: [{
      unique: true,
      fields: ["ID"]
    }, {
      fields: ["service"]
    }, {
      fields: ["episode"]
    }, {
      fields: ["version"]
    }, {
      fields: ["service_id"]
    }, {
      fields: ["episode_id"]
    }, {
      fields: ["version_id"]
    }, {
      fields: ["when"]
    }, {
      fields: ["day"]
    },]
  });

  return Broadcast;
};


