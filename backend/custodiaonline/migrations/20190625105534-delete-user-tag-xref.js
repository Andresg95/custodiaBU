"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_tag_xref");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable(
        "user_tag_xref",
        {
          tag_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          user_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          }
        },
        {
          timestamps: false
        }
      )
      .then(() =>
        queryInterface.addConstraint("user_tag_xref", ["tag_id"], {
          type: "FOREIGN KEY",
          name: "FK_tag_usertagxref",
          references: {
            table: "tag",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        })
      )
      .then(() =>
        queryInterface.addConstraint("user_tag_xref", ["user_id"], {
          type: "FOREIGN KEY",
          name: "FK_user_usertagxref",
          references: {
            table: "user",
            field: "id"
          },
          onDelete: "no action",
          onUpdate: "no action"
        })
      ).then(() => {
        queryInterface.addIndex("user_tag_xref", ["tag_id", "user_id"], {
          type: "UNIQUE",
          name: "UK_user_tag"
        });
      });
  }
};
