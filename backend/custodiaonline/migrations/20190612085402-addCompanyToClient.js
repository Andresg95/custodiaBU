'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("client", "company", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true
        
      })
      .then( () =>{})
    
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.removeColumn("client", "company");
  }
};
