"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // CHATS table
    const createChatsSQL = `
      CREATE TABLE chats (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255),
        is_group BOOLEAN NOT NULL DEFAULT false,
        group_photo_url TEXT,
        created_by BIGINT NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `;

    // CHAT MEMBERS table
    const createChatMembersSQL = `
      CREATE TABLE chat_members (
        id BIGSERIAL PRIMARY KEY,
        chat_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        role VARCHAR(255) NOT NULL DEFAULT 'member',
        joined_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        FOREIGN KEY (chat_id) REFERENCES chats(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE (chat_id, user_id)
      )
    `;

    // MESSAGES table
    const createMessagesSQL = `
      CREATE TABLE messages (
        id BIGSERIAL PRIMARY KEY,
        chat_id BIGINT NOT NULL,
        sent_by BIGINT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        edited_at TIMESTAMP WITHOUT TIME ZONE NULL,
        FOREIGN KEY (chat_id) REFERENCES chats(id),
        FOREIGN KEY (sent_by) REFERENCES users(id)
      )
    `;

    // MESSAGE READ STATUS table
    const createMessageReadsSQL = `
      CREATE TABLE messages_read (
        message_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        read_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        PRIMARY KEY (message_id, user_id),
        FOREIGN KEY (message_id) REFERENCES messages(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `;

    await queryInterface.sequelize.query(createChatsSQL);
    await queryInterface.sequelize.query(createChatMembersSQL);
    await queryInterface.sequelize.query(createMessagesSQL);
    await queryInterface.sequelize.query(createMessageReadsSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DROP TABLE IF EXISTS messages_read CASCADE",
    );
    await queryInterface.sequelize.query(
      "DROP TABLE IF EXISTS messages CASCADE",
    );
    await queryInterface.sequelize.query(
      "DROP TABLE IF EXISTS chat_members CASCADE",
    );
    await queryInterface.sequelize.query("DROP TABLE IF EXISTS chats CASCADE");
  },
};
