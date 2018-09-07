"use strict";

module.exports = function(sequelize, DataTypes) {
  const DATES = [
    "start", "end", "busyStart", "busyEnd"
  ];
  const STRINGS = [
    "host", "kind", "sender"
  ];
  const SECTIONS = [
    "event", "identity", "meta", "raw", "target", "timing"
  ];


  let schema = {
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  };

  let indexes = [];

  function addFields(names, spec, index) {
    for (const f of names) {
      schema[f] = Object.assign({}, spec);
      if (index)
        indexes.push({
          fields: [f]
        });
    }
  }

  addFields(DATES, {
    type: DataTypes.DATE,
    allowNull: false,
  }, true);

  addFields(STRINGS, {
    type: DataTypes.STRING(80),
    allowNull: true,
  }, true);

  addFields(SECTIONS, {
    type: DataTypes.TEXT,
    allowNull: true,
  }, false);

  const Event = sequelize.define("event", schema, {
    tableName: "event",
    timestamps: false,
    indexes
  });

  return Event;
};

