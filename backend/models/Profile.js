// models/Profile.js
const { pool } = require('./index');

const Profile = {
  async findAll() {
    const query = `
      SELECT * FROM profiles
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async create(profileData) {
    const { 
      name, role, age, gender, genre, 
      experience, main_image, concert_image, last_song, last_song_desc 
    } = profileData;

    const query = `
      INSERT INTO profiles (
      name, role, age, gender, genre, 
      experience, main_image, concert_image, last_song, last_song_desc 
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      name, role, age, gender, genre, 
      experience, main_image, concert_image, last_song, last_song_desc
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Profile.create:', error);
      throw error;
    }
  }
};

module.exports = Profile;