"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS interactions (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL REFERENCES profiles(username),
        target_username VARCHAR(255) NOT NULL REFERENCES profiles(username),
        interaction_type VARCHAR(50) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await queryInterface.sequelize.query(createTableSQL);
  },

  async down(queryInterface) {
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS interactions;');
  },
};
