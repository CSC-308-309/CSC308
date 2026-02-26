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
      const matchQuery = `
        SELECT EXISTS (
          SELECT 1
          FROM interactions i1
          JOIN users u1 ON u1.id = i1.user_id
          JOIN users u2 ON u2.id = i1.target_user_id
          JOIN interactions i2
            ON i2.user_id = i1.target_user_id
           AND i2.target_user_id = i1.user_id
          WHERE u1.username = $1
            AND u2.username = $2
            AND i1.interaction_type = 'like'
            AND i2.interaction_type = 'like'
        ) AS is_match
      `;
      const matchResult = await pool.query(matchQuery, values);
      const isMatch = Boolean(matchResult.rows[0]?.is_match);

      return {
        success: true,
        isMatch,
        message: isMatch
          ? `You matched with ${targetUsername}`
          : `User ${username} liked user ${targetUsername}`,
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

  async undoInteraction(username, targetUsername, interactionType) {
    const query = `
      DELETE FROM interactions i
      USING users u1, users u2
      WHERE i.user_id = u1.id
        AND i.target_user_id = u2.id
        AND u1.username = $1
        AND u2.username = $2
        AND i.interaction_type = $3
      RETURNING i.id, i.user_id, i.target_user_id, i.interaction_type
    `;

    try {
      const { rows } = await pool.query(query, [
        username,
        targetUsername,
        interactionType,
      ]);
      return {
        success: rows.length > 0,
        deletedCount: rows.length,
        interaction: rows[0] || null,
      };
    } catch (error) {
      console.error("Error in undoInteraction:", error);
      throw error;
    }
  },

  async listMatches(username) {
    const query = `
      SELECT DISTINCT
        u.id,
        u.username,
        u.email,
        u.name,
        u.role,
        u.age,
        u.gender,
        u.genre,
        u.experience,
        u.main_image,
        u.concert_image,
        u.last_song,
        u.last_song_desc,
        i1.created_at AS matched_at
      FROM users me
      JOIN interactions i1
        ON i1.user_id = me.id
       AND i1.interaction_type = 'like'
      JOIN interactions i2
        ON i2.user_id = i1.target_user_id
       AND i2.target_user_id = i1.user_id
       AND i2.interaction_type = 'like'
      JOIN users u
        ON u.id = i1.target_user_id
      WHERE me.username = $1
      ORDER BY i1.created_at DESC
    `;

    try {
      const { rows } = await pool.query(query, [username]);
      return rows;
    } catch (error) {
      console.error("Error in listMatches:", error);
      throw error;
    }
  },
};
