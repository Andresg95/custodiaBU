"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    // logic for reverting the changes
    return queryInterface.removeColumn("client", "storage_size");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("client", "storage_size", {type: Sequelize.INTEGER});
  }
};
