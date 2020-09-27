"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(
        "field_file_xref",
        {
          file_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          field_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          value: {
            type: Sequelize.STRING,
          }
        },
        {
          timestamps: false
        }
      )
      .then(() => {
        queryInterface.addConstraint("field_file_xref", ["file_id"], {
          type: "FOREIGN KEY",
          name: "FK_file_fieldfilexref",
          references: {
            table: "file",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        });
      })
      .then(() => {
        queryInterface.addConstraint("field_file_xref", ["field_id"], {
          type: "FOREIGN KEY",
          name: "FK_field_fieldfilexref",
          references: {
            table: "field",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        });
      })
      .then(() => {
        queryInterface.addIndex("field_file_xref", ["file_id", "field_id"], {
          type: "UNIQUE",
          name: "UK_file_field"
        });
      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("field_file_xref");
  }
};
