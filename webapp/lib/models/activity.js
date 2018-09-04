/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('activity', {
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
      primaryKey: true,
      field: 'histid'
    },
    batchId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'batch_id'
    },
    when: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'when'
    },
    userCaps: {
      type: DataTypes.STRING(70),
      allowNull: false,
      field: 'user_caps'
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'action'
    },
    objectType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'object_type'
    },
    objectSubtype: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'object_subtype'
    },
    objectName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'object_name'
    },
    objectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'object_id'
    },
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'user_id'
    },
    histIp: {
      type: DataTypes.STRING(55),
      allowNull: false,
      field: 'hist_ip'
    },
    histTime: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'hist_time'
    },
    userLogin: {
      type: DataTypes.STRING(60),
      allowNull: false,
      field: 'user_login'
    },
    userPass: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'user_pass'
    },
    userNicename: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'user_nicename'
    },
    userEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'user_email'
    },
    userUrl: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'user_url'
    },
    userRegistered: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'user_registered'
    },
    userStatus: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'user_status'
    },
    displayName: {
      type: DataTypes.STRING(250),
      allowNull: false,
      field: 'display_name'
    }
  }, {
    tableName: 'activity'
  });
};
