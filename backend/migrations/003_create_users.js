"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createTableSQL = `
      CREATE TABLE users (
        username VARCHAR(255) PRIMARY KEY NOT NULL,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await queryInterface.sequelize.query(createTableSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE users');
  },
};
