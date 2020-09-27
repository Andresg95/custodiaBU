'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.dropTable('user_file_xref');
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.createTable('user_file_xref', {
      file_id: {
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
    queryInterface.addConstraint("user_file_xref", ["file_id"], {
      type: "FOREIGN KEY",
      name: "FK_file_userfilexref",
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
      name: "FK_user_userfilexref",
      references: {
        table: "user",
        field: "id"
      },
      onDelete: "no action",
      onUpdate: "no action"
    })
  ).then(() => {
    queryInterface.addIndex("user_file_xref", ["file_id", "user_id"], {
      type: "UNIQUE",
      name: "UK_user_file"
    });
  });

  }
};
