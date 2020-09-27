'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tag").then(()=>{});
  },

  down: (queryInterface, Sequelize) => {
    
      return queryInterface.createTable("tag", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        department_id: {
          type: Sequelize.INTEGER,
           allowNull: true
        },
        name: {
          type: Sequelize.STRING,
        },
        parent_folder: {
          type: Sequelize.STRING,
        }
      }).then(()=>{

        queryInterface.addConstraint("tag", ["department_id"], {
          type: "FOREIGN KEY",
          name: "FK_tag_departmentidxref",
          references: {
            table: "department",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        })
      })

  }
};
