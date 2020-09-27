'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
    .addColumn("client", "cifnif", {
      type: Sequelize.STRING,
      allowNull: false
    })
    .then(() => {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("client", "cifnif");
  }
};
