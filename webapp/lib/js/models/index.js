"use strict";

module.exports = function(sequelize) {
  const Broadcast = sequelize.import(__dirname + "/broadcast.js");
  const Day = sequelize.import(__dirname + "/day.js");
  const Episode = sequelize.import(__dirname + "/episode.js");
  const Service = sequelize.import(__dirname + "/service.js");
  const MasterBrand = sequelize.import(__dirname + "/master-brand.js");

  if (0) {

    Broadcast.belongsTo(Episode, {
      foreignKey: "episode_id",
      targetKey: "ID",
      as: "episode"
    });

    Broadcast.belongsTo(Service, {
      foreignKey: "service_id",
      targetKey: "ID",
      as: "service"
    });

    Broadcast.belongsTo(Day, {
      foreignKey: "day",
      targetKey: "day",
      as: "dayInfo"
    });

    Episode.hasMany(Broadcast, {
      foreignKey: "episode_id",
      targetKey: "ID",
      as: "broadcasts"
    });

    Service.hasMany(Broadcast, {
      foreignKey: "service_id",
      targetKey: "ID",
      as: "broadcasts"
    });

    Service.belongsTo(MasterBrand, {
      foreignKey: "master_brand_id",
      targetKey: "ID",
      as: "masterBrand"
    });

    Day.hasMany(Broadcast, {
      foreignKey: "day",
      targetKey: "ID",
      as: "broadcasts"
    });

    MasterBrand.hasMany(Service, {
      foreignKey: "master_brand_id",
      targetKey: "ID",
      as: "services"
    });
  }

  return {
    Day,
    Broadcast,
    Episode,
    Service,
    MasterBrand,
  };
}

