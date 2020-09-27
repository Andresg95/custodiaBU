"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint("client", "planId").then(() =>
      queryInterface.addConstraint("client", ["planId"], {
        type: "FOREIGN KEY",
        name: "planId",
        references: {
          table: "plan",
          field: "id"
        },
        onDelete: "set null",
        onUpdate: "cascade"
      })
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint("client", "planId");
  }
};
