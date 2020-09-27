module.exports = (sequelize, DataTypes) => {
  const client = sequelize.define(
    "client",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        field: "name"
      },
      last_names: {
        type: DataTypes.STRING,
        field: "last_names"
      },
      email: {
        type: DataTypes.STRING,
        field: "email"
      },
      planId: {
        type: DataTypes.INTEGER,
        field: "planId",
        allowNull: true
      },
      storage_in_use: {
        type: DataTypes.FLOAT,
        field: "storage_in_use"
      },
      color: {
        type: DataTypes.STRING,
        field: "color"
      },
      avatar: {
        type: DataTypes.STRING,
        field: "avatar" 
      },
      cifnif: {
        type: DataTypes.STRING,
        field: "cifnif"
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        field: "deleted"
      },
      deleted_at: {
        type: DataTypes.DATE,
        field: "deleted_at"
      },
      password: {
        type: DataTypes.STRING,
        field: "password"
      },
      company: {
        type: DataTypes.STRING,
        field: "company"
      },
    },
    {
      timestamps: false,
      tableName: "client",
      freezeTableName: true
    }
  );

  client.associate = function(models) {
    client.hasMany(models.user, {
      foreignKey: "client_id"
    });

    client.hasMany(models.department, {
      foreignKey: "client"
    });

    client.belongsTo(models.plan, {
      foreignKey: "planId"
    });
  };

  return client;
};
