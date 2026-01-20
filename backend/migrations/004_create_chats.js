"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createChatsSQL = `
      CREATE TABLE chats (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('dm', 'group')),
        name VARCHAR(255),
        avatar_url VARCHAR(255),
        created_by VARCHAR(255) NOT NULL REFERENCES users(username),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    const createChatParticipantsSQL = `
      CREATE TABLE chat_participants (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        username VARCHAR(255) NOT NULL REFERENCES users(username),
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(chat_id, username)
      )
    `;

    await queryInterface.sequelize.query(createChatsSQL);
    await queryInterface.sequelize.query(createChatParticipantsSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE chat_participants');
    await queryInterface.sequelize.query('DROP TABLE chats');
  },
};
