'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "file",
      "etag", {
        type: Sequelize.STRING,
        allowNull: false
      }
    ).then(() => {});
  },

  down: (queryInterface, Sequelize) => {
     return queryInterface.removeColumn("file", "etag");
  }
};
