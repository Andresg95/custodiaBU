'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('client', 'color', {
      type: Sequelize.STRING.BINARY,
      allowNull: true,
    }).then(()=>{})
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.removeColumn('client', 'color').then(()=>{})
  }
};
