export async function up(queryInterface) {
  // CHATS table
  const createChatsSQL = `
    CREATE TABLE IF NOT EXISTS chats (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255),
      is_group_chat BOOLEAN NOT NULL DEFAULT false,
      created_by BIGINT,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `;

  // CHAT MEMBERS table
  const createChatMembersSQL = `
    CREATE TABLE IF NOT EXISTS chat_members (
      id BIGSERIAL PRIMARY KEY,
      chat_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      joined_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE (chat_id, user_id)
    )
  `;

  // MESSAGES table
  const createMessagesSQL = `
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      chat_id BIGINT NOT NULL,
      sender_id BIGINT NOT NULL,
      content TEXT NOT NULL,
      message_type VARCHAR(50) NOT NULL DEFAULT 'text',
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      FOREIGN KEY (chat_id) REFERENCES chats(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    )
  `;

  // MESSAGE READ STATUS table
  const createMessageReadsSQL = `
    CREATE TABLE IF NOT EXISTS messages_read (
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
}

export async function down(queryInterface) {
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
};
