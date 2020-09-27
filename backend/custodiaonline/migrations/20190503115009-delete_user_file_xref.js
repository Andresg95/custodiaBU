"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_file_xref");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(
        "user_file_xref",
        {
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          file_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          }
        },
        {
          timestamps: false
        }
      )
      .then(() =>
        queryInterface.addConstraint("user_file_xref", ["file_id"], {
          type: "FOREIGN KEY",
          name: "FK_file_fileuserxref",
          references: {
            table: "file",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        })
      )
      .then(() =>
        queryInterface.addConstraint("user_file_xref", ["user_id"], {
          type: "FOREIGN KEY",
          name: "FK_user_fileuserxref",
          references: {
            table: "user",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        })
      );
  }
};
