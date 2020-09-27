'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "file",
      "url", {
        type: Sequelize.STRING,
        allowNull: false
      }
    ).then(() =>{});
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.removeColumn("file", "url")
  }
};
