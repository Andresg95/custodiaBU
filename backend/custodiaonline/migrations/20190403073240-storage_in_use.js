'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("client", "storage_in_use", {
      type: Sequelize.FLOAT,
      defaultValue: 0.0,
      allowNull: false,
    })
    .then(()=>{})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("client", "storage_in_use");
  }
};
