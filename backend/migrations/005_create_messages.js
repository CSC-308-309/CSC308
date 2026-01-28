"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createTableSQL = `
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        sender_username VARCHAR(255) NOT NULL REFERENCES users(username),
        text TEXT NOT NULL,
        client_message_id VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        edited_at TIMESTAMP
      )
    `;

    await queryInterface.sequelize.query(createTableSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE messages');
  },
};
