module.exports = (sequelize, DataTypes) => {
  const admin = sequelize.define(
    "admin",
    {

      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        field: "email"
      },
      password: {
        type: DataTypes.STRING,
        field: "password"
      }
    },
    {
      timestamps: false,
      tableName: "admin",
      freezeTableName: true
    }
  );

  return admin;
};
