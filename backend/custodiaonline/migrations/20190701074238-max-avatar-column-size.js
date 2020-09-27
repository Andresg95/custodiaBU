'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('client', 'avatar').then(()=>{

      queryInterface.addColumn('client', 'avatar', {
        type: Sequelize.STRING(50000),
        allowNull: true
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('client', 'avatar', ).then(()=>{
      
      queryInterface.addColumn('client', 'avatar', {
        type: Sequelize.STRING(255),
        allowNull: true
      })
    })
  }
};
