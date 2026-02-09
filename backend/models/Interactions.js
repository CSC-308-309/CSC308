// models/Interactions.js
import pool from '../db/index.js';

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
          interaction: result.rows[0]
        };
    } catch (error) {
        console.error('Error in likeUser:', error);
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
          interaction: result.rows[0]
        };
    } catch (error) {
        console.error('Error in dislikeUser:', error);
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
          interaction: result.rows[0]
        };
    } catch (error) {
        console.error('Error in blockUser:', error);
        throw error;
    }
  },
};