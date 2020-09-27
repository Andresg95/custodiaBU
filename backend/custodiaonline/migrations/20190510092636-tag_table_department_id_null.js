"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("tag", "department_id", {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .removeColumn("tag", "department_id")
      .then(() =>
        queryInterface.addColumn("tag", "department_id", {
          type: Sequelize.INTEGER,
          allowNull: false
        })
      );
  }
};
