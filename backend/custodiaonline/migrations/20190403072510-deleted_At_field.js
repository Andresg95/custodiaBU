'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("client", "deleted_at", {
        type: Sequelize.DATE,
        defaultValue: null,
        allowNull: true
        
      })
      .then( () =>{})
    
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.removeColumn("client", "deleted_at");
  }
};
