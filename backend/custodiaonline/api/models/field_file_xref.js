module.exports = (sequelize, DataTypes) => {
  const field_file_xref = sequelize.define(
    "field_file_xref",
    {
      file_id: {
        type: DataTypes.INTEGER,
        field: "file_id",
        allowNull: false
      },
      field_id: {
        type: DataTypes.INTEGER,
        field: "field_id",
        allowNull: false,
        primaryKey: true
        
      },
      value: {
        type: DataTypes.STRING,
        field: "value"
      }
    },
    {
      timestamps: false,
      tableName: "field_file_xref",
      freezeTableName: true
    }
  );

  field_file_xref.removeAttribute('id');

  field_file_xref.associate = models => {
    field_file_xref.belongsTo(models.field, {
      foreignKey: "field_id"
    });

    field_file_xref.belongsTo(models.file, {
      foreignKey: "file_id"
    });
  };

  return field_file_xref;
};
