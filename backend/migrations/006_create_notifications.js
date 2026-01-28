"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createTableSQL = `
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL REFERENCES users(username),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        data JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await queryInterface.sequelize.query(createTableSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE notifications');
  },
};
