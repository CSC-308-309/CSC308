// models/Profile.js
import pool from '../db/index.js';

// Columns returned for profile/list — exclude password_hash
const USER_COLUMNS =
  'id, username, email, name, role, age, gender, genre, experience, main_image, concert_image, last_song, last_song_desc, created_at, updated_at';

export const ProfileModel = {
  async listUsers() {
    const query = `
      SELECT ${USER_COLUMNS} FROM users
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getUserByUsername(username) {
    const query = `
      SELECT ${USER_COLUMNS} FROM users WHERE username = $1
    `;
    const values = [username];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async updateUser(username, updateData) {
    const fields = Object.keys(updateData);
    if (fields.length === 0) throw new Error('No fields to update');
    const setClause = fields.map((field, idx) => `${field} = $${idx + 2}`).join(', ');
    const values = [username, ...fields.map(f => updateData[f])];
    const query = `
      UPDATE users SET ${setClause}
      WHERE username = $1
      RETURNING ${USER_COLUMNS}
    `;
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Profile.updateUser:', error);
      throw error;
    }
  },

  async deleteUser(username) {
    const query = `
      DELETE FROM users WHERE username = $1 RETURNING ${USER_COLUMNS}
    `;
    try {
      const result = await pool.query(query, [username]);
      return result.rows[0] ?? null;
    } catch (error) {
      console.error('Error in Profile.deleteUser:', error);
      throw error;
    }
  },

  async updateCoverPhoto(username, coverPhotoData) {
    // TODO: add photo url to database
    // NOTE: For now, just printing the data
    console.log(`Updating cover photo for ${username}:`, coverPhotoData);
    return { username, coverPhotoUrl: coverPhotoData.url };
  },
};
