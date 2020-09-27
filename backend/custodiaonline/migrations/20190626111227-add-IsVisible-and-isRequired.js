'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.addColumn('field', 'is_required', {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }).then(()=>{
      queryInterface.addColumn('field', 'is_visible', {
        type: Sequelize.BOOLEAN,
        allowNull: false
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('field', 'is_required').then(()=>{
      queryInterface.removeColumn('field', 'is_visible');
    })
  }
};
