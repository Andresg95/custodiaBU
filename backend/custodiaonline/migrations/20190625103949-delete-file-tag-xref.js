"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("file_tag_xref");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(
        "file_tag_xref",
        {
          tag_id: {
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
        queryInterface.addConstraint("file_tag_xref", ["file_id"], {
          type: "FOREIGN KEY",
          name: "FK_file_filetagxref",
          references: {
            table: "file",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        })
      )
      .then(() =>
        queryInterface.addConstraint("file_tag_xref", ["tag_id"], {
          type: "FOREIGN KEY",
          name: "FK_tag_filetagxref",
          references: {
            table: "tag",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        })
      );
  }
};
