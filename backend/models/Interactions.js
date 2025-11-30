// models/Interactions.js
import pool from '../db/index.js';

export const InteractionsModel = {
  async likeUser(username, targetUsername) {
    const query = `
      INSERT INTO interactions (username, target_username, interaction_type)
        VALUES ($1, $2, 'like')
    `;

    const values = [username, targetUsername];
    try {
        await pool.query(query, values);
        return { message: `User ${username} liked User ${targetUsername}` };
    }catch (error) {
        console.error('Error in likeUser:', error);
        throw error;
    }
  },

    async dislikeUser(username, targetUsername) {
    const query = `
      INSERT INTO interactions (username, target_username, interaction_type)
        VALUES ($1, $2, 'dislike')
    `;

    const values = [username, targetUsername];
    try {
        await pool.query(query, values);
        return { message: `User ${username} liked User ${targetUsername}` };
    }catch (error) {
        console.error('Error in likeUser:', error);
        throw error;
    }
  },

    async blockUser(username, targetUsername) {
    const query = `
      INSERT INTO interactions (username, target_username, interaction_type)
        VALUES ($1, $2, 'block')
    `;

    const values = [username, targetUsername];
    try {
        await pool.query(query, values);
        return { message: `User ${username} liked User ${targetUsername}` };
    }catch (error) {
        console.error('Error in likeUser:', error);
        throw error;
    }
  },
};