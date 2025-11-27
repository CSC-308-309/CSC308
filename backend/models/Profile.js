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

  async getUserById(id) {
    const query = `
      SELECT * FROM profiles WHERE id = $1';
    `;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async createUser(profileData) {
    const {
      username,
      name,
      role,
      age,
      gender,
      genre,
      experience,
      main_image,
      concert_image,
      last_song,
      last_song_desc,
    } = profileData;

    const query = `
      INSERT INTO profiles (
      username, name, role, age, gender, genre, 
      experience, main_image, concert_image, last_song, last_song_desc 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, profileData);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Profile.create:', error);
      throw error;
    }
  },
};
module.exports = Profile;
