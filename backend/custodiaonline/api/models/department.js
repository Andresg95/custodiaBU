module.exports = (sequelize, DataTypes) => {
    const department = sequelize.define('department',
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
        client: {
          type: DataTypes.INTEGER,
          field: "client_id"
        }
      },
      {
        timestamps: false,
        tableName: "department",
        freezeTableName: true
      }
    );
  
      department.associate = function (models) {
        department.hasMany(models.user, {
          foreignKey: 'department_id'
        })
      
        department.hasMany(models.field, {
          foreignKey: 'department_id'
        })

        department.belongsTo(models.client,{
          foreignKey: "client",
          as: "owner"
        })
      }
  
      return department;
  
  
  };
  