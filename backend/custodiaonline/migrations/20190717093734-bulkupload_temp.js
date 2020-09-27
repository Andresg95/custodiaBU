"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "bulk_upload_temp",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        timestamp: {
          type: Sequelize.DATE
        }
      },
      {
        timestamps: false
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("bulk_upload_temp");
  }
};
