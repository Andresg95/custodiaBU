module.exports = (sequelize, DataTypes) => {
  const file = sequelize.define('file',
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
      creation_date: {
        type: DataTypes.STRING,
        field: "creation_date"
      },
      extension: {
        type: DataTypes.STRING,
        field: "extension"
      },
      url: {
        type: DataTypes.STRING,
        field: "url"
      },
      etag: {
        type: DataTypes.STRING,
        field: "etag"
      },
      department_id: {
        type: DataTypes.INTEGER,
        field: "department_id"
      }
    },
    {
      timestamps: false,
      tableName: "file",
      freezeTableName: true
    }
  );

  file.associate = models => {
    file.belongsToMany(models.field, {
      as: "fields",
      through: "field_file_xref",
      foreignKey: "field_id",
      otherKey: "id"
    });


    file.belongsTo(models.field_file_xref, {
      foreignKey: "id",
      column: "field_id"
    });

    file.belongsTo(models.department, {
      foreignKey: "department_id",
    });

  };

  return file;
};
