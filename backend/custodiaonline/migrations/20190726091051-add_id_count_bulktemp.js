"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("bulk_upload_temp", "count", {
        type: Sequelize.INTEGER,
        allowNull: false
      })
      .then(() => {
        queryInterface.addColumn("bulk_upload_temp", "operation_id", {
          type: Sequelize.STRING,
          allowNull: false
        });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("bulk_upload_temp", "count").then(() => {
      queryInterface.removeColumn("bulk_upload_temp", "operation_id");
    });
  }
};
