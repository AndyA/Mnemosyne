/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('activityHwm', {
    host: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'host'
    },
    database: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'database'
    },
    table: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      field: 'table'
    },
    histid: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'histid'
    }
  }, {
    tableName: 'activity_hwm'
  });
};
