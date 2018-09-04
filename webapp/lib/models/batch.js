/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Batch = sequelize.define("batch", {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: "ID"
    },
    when: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
      field: "when"
    },
    homeIp: {
      type: DataTypes.STRING(55),
      allowNull: false,
      field: "home_ip"
    }
  }, {
    tableName: "batch",
    timestamps: false,
  });
  return Batch;
};
