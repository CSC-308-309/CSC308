// models/Profile.js
import pool from '../db/index.js';

export const ProfileModel = {
  async listUsers() {
    const query = `
      SELECT * FROM profiles
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getUserByUsername(username) {
    const query = `
      SELECT * FROM profiles WHERE username = $1
    `;
    const values = [username];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async createUser(profileData) {
    // Accept a JSON object and map to the correct column order
    const query = `
      INSERT INTO profiles (
        username, name, role, age, gender, genre,
        experience, main_image, concert_image, last_song, last_song_desc
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      profileData.username,
      profileData.name,
      profileData.role,
      profileData.age,
      profileData.gender,
      profileData.genre,
      profileData.experience,
      profileData.main_image,
      profileData.concert_image,
      profileData.last_song,
      profileData.last_song_desc,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Profile.createUser:', error);
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

  async updateCoverPhoto(username, coverPhotoData) {
    // TODO: add photo url to database
    // NOTE: For now, just printing the data
    console.log(`Updating cover photo for ${username}:`, coverPhotoData);
    return { username, coverPhotoUrl: coverPhotoData.url };
  },
};
