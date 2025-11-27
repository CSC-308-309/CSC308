// models/Interactions.js
const { pool } = require('../db/index');

const Interactions = {
  async likeUser(userId, targetUserId) {
    const query = `
      INSERT INTO interactions (username, target_username, interaction_type)
        VALUES ($1, $2, 'like')
    `;

    const values = [userId, targetUserId];
    try {
        await pool.query(query, values);
        return { message: `User ${userId} liked User ${targetUserId}` };
    }catch (error) {
        console.error('Error in likeUser:', error);
        throw error;
    }
  },

    async dislikeUser(userId, targetUserId) {
    const query = `
      INSERT INTO interactions (username, target_username, interaction_type)
        VALUES ($1, $2, 'dislike')
    `;

    const values = [userId, targetUserId];
    try {
        await pool.query(query, values);
        return { message: `User ${userId} liked User ${targetUserId}` };
    }catch (error) {
        console.error('Error in likeUser:', error);
        throw error;
    }
  },

    async blockUser(userId, targetUserId) {
    const query = `
      INSERT INTO interactions (username, target_username, interaction_type)
        VALUES ($1, $2, 'block')
    `;

    const values = [userId, targetUserId];
    try {
        await pool.query(query, values);
        return { message: `User ${userId} liked User ${targetUserId}` };
    }catch (error) {
        console.error('Error in likeUser:', error);
        throw error;
    }
  },
};
module.exports = Interactions;