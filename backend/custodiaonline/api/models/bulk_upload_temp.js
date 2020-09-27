module.exports = (sequelize, DataTypes) => {
  const bulk_upload_temp = sequelize.define(
    "bulk_upload_temp",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        field: "name"
      },
      timestamp: {
        type: DataTypes.DATE,
        field: "timestamp"
      },
      operation_id: {
        type: DataTypes.STRING,
        field: "operation_id"
      },
      count: {
          type: DataTypes.INTEGER,
          field: "count"
      }
    },
    {
      timestamps: false,
      tableName: "bulk_upload_temp",
      freezeTableName: true
    }
  );

  return bulk_upload_temp;
};
