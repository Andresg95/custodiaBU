'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.addConstraint("field", ["department_id"], {
      type: "FOREIGN KEY",
      name: "FK_department_id",
      references: {
        table: "department",
        field: "id"
      },
      onDelete: "set null",
      onUpdate: "cascade"
    })
  
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.removeConstraint("field", "FK_department_id");
  }
};
