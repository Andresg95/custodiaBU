'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("tag", "parent_folder", {
      type: Sequelize.STRING,
      allowNull: true,
    })
    .then(()=>{})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("tag", "parent_folder");
  }
};
