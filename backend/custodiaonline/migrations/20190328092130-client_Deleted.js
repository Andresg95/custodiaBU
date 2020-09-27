'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface
   .addColumn("client", "deleted", {
     type: Sequelize.BOOLEAN,
     defaultValue: 0,
     allowNull: false,
   })
   .then( ()=>{})
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.removeColumn("client", "deleted");
  }
};
