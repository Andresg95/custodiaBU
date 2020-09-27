module.exports = (sequelize, DataTypes) => {
  const field = sequelize.define(
    "field",
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
      type: {
        type: DataTypes.STRING,
        field: "type"
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        field: "is_required"
      },
      is_visible: {
        type: DataTypes.BOOLEAN,
        field: "is_visible"
      },
      department_id: {
        type: DataTypes.INTEGER,
        field: "department_id"
      }
    },
    {
      timestamps: false,
      tableName: "field",
      freezeTableName: true
    }
  );

  field.associate = models => {
    field.belongsToMany(models.file, {
      as: "files",
      through: "field_file_xref",
      foreignKey: "file_id",
      otherKey: "id"
    });

    field.belongsTo(models.department, {
      foreignKey: "department_id"
    });

    field.hasMany(models.field_file_xref, {
      foreignKey: "field_id"
    })
  };

  return field;
};
