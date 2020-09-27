'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('field', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
      },
      department_id: { 
        type: Sequelize.INTEGER,
      }
    }).then(()=>{});

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('field');
  }
};
