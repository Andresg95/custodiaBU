'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'client',
            'planId', {
                type: Sequelize.INTEGER,

            }
        ).then(() =>
            queryInterface.addConstraint("client", ["planId"], {
                type: "FOREIGN KEY",
                name: "planId",
                references: {
                    table: "plan",
                    field: "id"
                },
                onDelete: "RESTRICT",
                onUpdate: "no action"
            })
        );
    },

    down: (queryInterface, Sequelize) => {
      
            return queryInterface.removeColumn("client", "planId");
       
    }   
};