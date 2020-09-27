'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('client', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true,
    }).then(()=>{})
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.removeColumn('client', 'avatar').then(()=>{})
  }
};
