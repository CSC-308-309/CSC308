// models/Interactions.js
import pool from "../db/index.js";

export const InteractionsModel = {
  async likeUser(username, targetUsername) {
    const query = `
      INSERT INTO interactions (user_id, target_user_id, interaction_type)
      SELECT u1.id, u2.id, 'like'
      FROM users u1, users u2
      WHERE u1.username = $1 AND u2.username = $2
      ON CONFLICT (user_id, target_user_id, interaction_type) 
      DO UPDATE SET created_at = NOW()
      RETURNING id, user_id, target_user_id, interaction_type, created_at
    `;

    const values = [username, targetUsername];
    try {
      const result = await pool.query(query, values);
      return {
        success: true,
        message: `User ${username} liked user ${targetUsername}`,
        interaction: result.rows[0],
      };
    } catch (error) {
      console.error("Error in likeUser:", error);
      throw error;
    }
  },

  async dislikeUser(username, targetUsername) {
    const query = `
      INSERT INTO interactions (user_id, target_user_id, interaction_type)
      SELECT u1.id, u2.id, 'dislike'
      FROM users u1, users u2
      WHERE u1.username = $1 AND u2.username = $2
      ON CONFLICT (user_id, target_user_id, interaction_type) 
      DO UPDATE SET created_at = NOW()
      RETURNING id, user_id, target_user_id, interaction_type, created_at
    `;

    const values = [username, targetUsername];
    try {
      const result = await pool.query(query, values);
      return {
        success: true,
        message: `User ${username} disliked user ${targetUsername}`,
        interaction: result.rows[0],
      };
    } catch (error) {
      console.error("Error in dislikeUser:", error);
      throw error;
    }
  },

  async blockUser(username, targetUsername) {
    const query = `
      INSERT INTO interactions (user_id, target_user_id, interaction_type)
      SELECT u1.id, u2.id, 'block'
      FROM users u1, users u2
      WHERE u1.username = $1 AND u2.username = $2
      ON CONFLICT (user_id, target_user_id, interaction_type) 
      DO UPDATE SET created_at = NOW()
      RETURNING id, user_id, target_user_id, interaction_type, created_at
    `;

    const values = [username, targetUsername];
    try {
      const result = await pool.query(query, values);
      return {
        success: true,
        message: `User ${username} blocked user ${targetUsername}`,
        interaction: result.rows[0],
      };
    } catch (error) {
      console.error("Error in blockUser:", error);
      throw error;
    }
  },

  // List all interactions initiated by a user.
  // This powers the frontend filter so swiped profiles don't reappear after refresh.
  async listUserInteractions(username) {
    const query = `
      SELECT
        i.id,
        u1.username AS username,
        u2.username AS target_username,
        i.interaction_type,
        i.created_at
      FROM interactions i
      JOIN users u1 ON u1.id = i.user_id
      JOIN users u2 ON u2.id = i.target_user_id
      WHERE u1.username = $1
      ORDER BY i.created_at DESC
    `;

    try {
      const { rows } = await pool.query(query, [username]);
      return rows;
    } catch (error) {
      console.error("Error in listUserInteractions:", error);
      throw error;
    }
  },
};
