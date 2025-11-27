// models/Profile.js
const { pool } = require('../db/index');

const Profile = {
  async listUsers() {
    const query = `
      SELECT * FROM profiles
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getUserById(username) {
    const query = `
      SELECT * FROM profiles WHERE username = $1';
    `;
    const values = [username];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async createUser(profileData) {

    const query = `
      INSERT INTO profiles (
      username, name, role, age, gender, genre, 
      experience, main_image, concert_image, last_song, last_song_desc 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING username
    `;

    try {
      const result = await pool.query(query, profileData);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Profile.create:', error);
      throw error;
    }
  },

  async updateUser(username, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) throw new Error('No fields to update');
    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    const values = [username, ...fields.map(f => updateData[f])];
    const query = `
      UPDATE profiles SET ${setClause}
      WHERE username = $1
      RETURNING username
    `;
    try {
      const result = await pool.query(query, values);
      return result.rows[0]?.username;
    } catch (error) {
      console.error('Error in Profile.updateUser:', error);
      throw error;
    }
  },

  async deleteUser(username) {
    const query = `
      DELETE FROM profiles WHERE username = $1 RETURNING *
    `;
    try {
      const result = await pool.query(query, [username]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Profile.deleteUser:', error);
      throw error;
    }
  },
};
module.exports = Profile;
