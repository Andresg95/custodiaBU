module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
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
      client_id: {
        type: DataTypes.INTEGER,
        field: "client_id"
      },
      department_id: {
        type: DataTypes.INTEGER,
        field: "department_id"
      },
      status: {
        type: DataTypes.STRING,
        field: "status"
      },
      cifnif: {
        type: DataTypes.STRING,
        field: "cifnif"
      },
      password: {
        type: DataTypes.STRING,
        field: "password"
      }
    },
    {
      timestamps: false,
      tableName: "user",
      freezeTableName: true
    }
  );

  user.associate = function(models) {
    user.belongsTo(models.client, {
      foreignKey: "client_id",
      as: "client"
    });

    user.belongsTo(models.department, {
      foreignKey: "department_id"
    });
  };
  return user;
};
