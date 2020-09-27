module.exports = (sequelize, DataTypes) => {
    const plan = sequelize.define('plan', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING,
            field: "name"
        },
        quote: {
            type: DataTypes.INTEGER,
            field: "quote"
        }
    }, {
        timestamps: false,
        tableName: "plan",
        freezeTableName: true
    });

    plan.associate = function(models) {
        plan.hasMany(models.client, {
            foreignKey: 'id'
        })
    }

    return plan;


};