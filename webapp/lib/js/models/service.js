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
    master_brand: {
      type: DataTypes.STRING(36),
      allowNull: true
    },
    master_brand_id: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("OK", "NOT FOUND", "ERROR"),
      allowNull: false
    },
    raw: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  };

  const Service = sequelize.define("service", schema, {
    tableName: "mnemosyne_pips_service",
    indexes: [{
      unique: true,
      fields: ["ID"]
    }, {
      fields: ["status"]
    }, {
      fields: ["master_brand"]
    }, {
      fields: ["master_brand_id"]
    }]
  });

  return Service;
};

