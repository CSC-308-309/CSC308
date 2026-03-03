import pool from "../db/index.js";

export const MessagesModel = {
  async listChats(queryParams) {
    const { username, limit = 50, offset = 0 } = queryParams;

    const query = `
            SELECT c.id, c.is_group, c.name, c.group_photo_url, c.created_by, c.created_at,
                   m.content as last_message_content, m.created_at as last_message_at,
                   u.username as last_message_sender,
                   0 as unread_count
            FROM chats c
            JOIN chat_members cm ON c.id = cm.chat_id
            LEFT JOIN messages m ON c.id = m.chat_id AND m.id = (
                SELECT MAX(id) FROM messages WHERE chat_id = c.id
            )
            LEFT JOIN users u ON m.sent_by = u.id
            WHERE cm.user_id = (SELECT id FROM users WHERE username = $1)
            ORDER BY m.created_at DESC NULLS LAST
            LIMIT $2 OFFSET $3
        `;

    try {
      const { rows } = await pool.query(query, [username, limit, offset]);
      return rows;
    } catch (error) {
      console.error("Error in listChats:", error);
      throw error;
    }
  },

  async createChat(chatData) {
    const { name, is_group = false, created_by, participants } = chatData;

    try {
      await pool.query("BEGIN");

      // Create chat
      const chatQuery = `
                INSERT INTO chats (is_group, name, created_by)
                VALUES ($1, $2, (SELECT id FROM users WHERE username = $3))
                RETURNING id, is_group, name, created_by, created_at
            `;
      const chatResult = await pool.query(chatQuery, [
        is_group,
        name,
        created_by,
      ]);
      const chat = chatResult.rows[0];

      // Add participants
      const participantQuery = `
                INSERT INTO chat_members (chat_id, user_id)
                VALUES ($1, (SELECT id FROM users WHERE username = $2))
                ON CONFLICT (chat_id, user_id) DO NOTHING
                RETURNING user_id
            `;

      for (const participant of participants) {
        await pool.query(participantQuery, [chat.id, participant]);
      }

      await pool.query("COMMIT");
      return chat;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Error in createChat:", error);
      throw error;
    }
  },

  async getChat(chatId) {
    const query = `
            SELECT c.id, c.is_group, c.name, c.created_by, c.created_at
            FROM chats c
            WHERE c.id = $1
        `;

    try {
      const { rows } = await pool.query(query, [chatId]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error in getChat:", error);
      throw error;
    }
  },

  async updateChat(chatId, updateData) {
    const allowedFields = ["name", "is_group"];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return null;
    }

    values.push(chatId);

    const query = `
            UPDATE chats 
            SET ${updateFields.join(", ")}
            WHERE id = $${paramCount}
            RETURNING id, is_group, name, created_by, created_at
        `;

    try {
      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error("Error in updateChat:", error);
      throw error;
    }
  },

  async deleteChat(chatId) {
    try {
      await pool.query("BEGIN");

      // Delete related records in order
      await pool.query("DELETE FROM messages WHERE chat_id = $1", [chatId]);
      await pool.query("DELETE FROM chat_members WHERE chat_id = $1", [chatId]);
      await pool.query("DELETE FROM chats WHERE id = $1", [chatId]);

      await pool.query("COMMIT");
      return true;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Error in deleteChat:", error);
      throw error;
    }
  },

  async listChatParticipants(chatId) {
    const query = `
            SELECT
            u.username,
            u.name,
            u.main_image AS avatar,
            cm.joined_at
            FROM chat_members cm
            JOIN users u ON cm.user_id = u.id
            WHERE cm.chat_id = $1
            ORDER BY cm.joined_at ASC
        `;

    try {
      const { rows } = await pool.query(query, [chatId]);
      return rows;
    } catch (error) {
      console.error("Error in listChatParticipants:", error);
      throw error;
    }
  },

  async addChatParticipants(chatId, participantsData) {
    const { participants } = participantsData;

    try {
      await pool.query("BEGIN");

      const query = `
                INSERT INTO chat_members (chat_id, user_id)
                VALUES ($1, (SELECT id FROM users WHERE username = $2))
                ON CONFLICT (chat_id, user_id) DO NOTHING
                RETURNING user_id
            `;

      const addedParticipants = [];
      for (const participant of participants) {
        const result = await pool.query(query, [chatId, participant]);
        if (result.rows.length > 0) {
          addedParticipants.push(result.rows[0]);
        }
      }

      await pool.query("COMMIT");
      return { success: true, addedParticipants };
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Error in addChatParticipants:", error);
      throw error;
    }
  },

  async removeChatParticipant(chatId, username) {
    const query = `
            DELETE FROM chat_members
            WHERE chat_id = $1 AND user_id = (SELECT id FROM users WHERE username = $2)
            RETURNING user_id
        `;

    try {
      const { rows } = await pool.query(query, [chatId, username]);
      return rows.length > 0;
    } catch (error) {
      console.error("Error in removeChatParticipant:", error);
      throw error;
    }
  },

  async listMessages(chatId, queryParams) {
    const { limit = 50, offset = 0, before } = queryParams;

    let query = `
            SELECT m.id, m.chat_id, m.sent_by, m.content, 
                   m.created_at, m.edited_at,
                   u.username as sender_username, u.name as sender_name, u.main_image as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sent_by = u.id
            WHERE m.chat_id = $1
        `;

    const values = [chatId];

    if (before) {
      query += ` AND m.created_at < $2`;
      values.push(before);
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    try {
      const { rows } = await pool.query(query, values);
      return rows.reverse(); // Return in chronological order
    } catch (error) {
      console.error("Error in listMessages:", error);
      throw error;
    }
  },

  async getMessage(chatId, messageId) {
    const query = `
            SELECT m.id, m.chat_id, m.sent_by, m.content, 
                   m.created_at, m.edited_at,
                   u.username as sender_username, u.name as sender_name, u.main_image as sender_avatar
            FROM messages m
            LEFT JOIN users u ON m.sent_by = u.id
            WHERE m.chat_id = $1 AND m.id = $2
        `;

    try {
      const { rows } = await pool.query(query, [chatId, messageId]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error in getMessage:", error);
      throw error;
    }
  },

  async sendMessage(chatId, messageData) {
    console.log("~~~~~~~~~~~~~~~~ sendMessage called with:", {
      chatId,
      messageData,
    });
    const { sender_username, content } = messageData;

    try {
      await pool.query("BEGIN");

      // Insert message
      const messageQuery = `
                INSERT INTO messages (chat_id, sent_by, content)
                VALUES ($1, (SELECT id FROM users WHERE username = $2), $3)
                RETURNING id, chat_id, sent_by, content, created_at
            `;
      const messageResult = await pool.query(messageQuery, [
        chatId,
        sender_username,
        content,
      ]);
      const message = messageResult.rows[0];

      await pool.query("COMMIT");
      return message;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Error in sendMessage:", error);
      throw error;
    }
  },

  async updateMessage(chatId, messageId, updateData) {
    const { content } = updateData;

    const query = `
            UPDATE messages 
            SET content = $1, edited_at = NOW()
            WHERE chat_id = $2 AND id = $3
            RETURNING id, chat_id, sent_by, content, created_at, edited_at
        `;

    try {
      const { rows } = await pool.query(query, [content, chatId, messageId]);
      return rows[0] || null;
    } catch (error) {
      console.error("Error in updateMessage:", error);
      throw error;
    }
  },

  async deleteMessage(chatId, messageId) {
    const query = `
            DELETE FROM messages 
            WHERE chat_id = $1 AND id = $2
            RETURNING id
        `;

    try {
      const { rows } = await pool.query(query, [chatId, messageId]);
      return rows.length > 0;
    } catch (error) {
      console.error("Error in deleteMessage:", error);
      throw error;
    }
  },

  async markChatRead(chatId, readData) {
    const { username, readUntilId } = readData;

    try {
      await pool.query("BEGIN");

      // Get user ID
      const userQuery = "SELECT id FROM users WHERE username = $1";
      const userResult = await pool.query(userQuery, [username]);

      if (userResult.rows.length === 0) {
        throw new Error("User not found");
      }
      const userId = userResult.rows[0].id;

      // Mark messages as read
      const readQuery = `
                INSERT INTO messages_read (message_id, user_id, read_at)
                SELECT id, $1, NOW()
                FROM messages 
                WHERE chat_id = $2 AND id <= $3
                ON CONFLICT (message_id, user_id) DO UPDATE SET read_at = NOW()
                RETURNING message_id
            `;

      const { rows } = await pool.query(readQuery, [
        userId,
        chatId,
        readUntilId,
      ]);

      await pool.query("COMMIT");
      return {
        success: true,
        chatId,
        readUntilId,
        markedCount: rows.length,
      };
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Error in markChatRead:", error);
      throw error;
    }
  },

  async setTyping(chatId, typingData) {
    const { username, isTyping } = typingData;

    // This would typically be handled with WebSockets or Redis for real-time updates
    // For now, we'll just return success
    return {
      success: true,
      chatId,
      username,
      isTyping,
      timestamp: new Date().toISOString(),
    };
  },
};
