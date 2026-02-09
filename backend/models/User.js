// models/User.js
import {pool} from '../db/index.js';
import bcrypt from 'bcrypt';

// Username validation regex: alphanumeric + underscores, 3-30 chars
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export const UsersModel = {
validateUsernameFormat(username) {
    if (!username) return false;
    return USERNAME_REGEX.test(username);
  },

  async checkUsernameExists(username) {
    const query = `
      SELECT username FROM users WHERE username = $1
      LIMIT 1
    `;
    
    try {
      const { rows } = await pool.query(query, [username]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error in UsersModel.checkUsernameExists:', error);
      throw error;
    }
  },
  async validateUser(username, password) {
    if (!this.validateUsernameFormat(username)) {
      return null;
    }

    const query = `
      SELECT username, password_hash FROM users WHERE username = $1
    `;
    const values = [username];
    
    try {
      const { rows } = await pool.query(query, values);
      if (rows.length === 0) {
        return null; 
      }
      
      const user = rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return null; 
      }
      
      return {
        username: user.username
      };
    } catch (error) {
      console.error('Error in Users.validateUser:', error);
      throw error;
    }
  },

  async createUser(email, passwordHash, username) {
    if (!this.validateUsernameFormat(username)) {
      throw new Error('Invalid username format');
    }

    if (await this.checkUsernameExists(username)) {
      throw new Error('Username already exists');
    }

    console.log("inSIDE CREATE USER FILEEEEE")
    
    const query = `
      INSERT INTO users (
        username, email, password_hash, name, role, age, gender, genre, experience,
        main_image, concert_image, last_song, last_song_desc
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, username, email, created_at
    `;

    const values = [
      username, email, passwordHash, username, 'User',
      null, null, null, null, null, null, null, null
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error in Users.createUser:', error);
      throw error;
    }
  },

  async findUserByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, name, role, age, gender, genre, experience,
             main_image, concert_image, last_song, last_song_desc, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    try {
      const { rows } = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in UsersModel.findUserByEmail:', error);
      throw error;
    }
  },

  async listUsers() {
    const query = `
      SELECT id, username, email, name, role, age, gender, genre, experience,
             main_image, concert_image, last_song, last_song_desc, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error in UsersModel.listUsers:', error);
      throw error;
    }
  },

  async getUserByUsername(username) {
    const query = `
      SELECT id, username, email, name, role, age, gender, genre, experience,
             main_image, concert_image, last_song, last_song_desc, created_at, updated_at
      FROM users
      WHERE username = $1
    `;
    
    try {
      const { rows } = await pool.query(query, [username]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in UsersModel.getUserByUsername:', error);
      throw error;
    }
  },

  async updateUser(username, updateData) {
    const allowedFields = ['name', 'role', 'age', 'gender', 'genre', 'experience', 
                          'main_image', 'concert_image', 'last_song', 'last_song_desc'];
    
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return null;
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(username);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE username = $${paramCount}
      RETURNING id, username, email, name, role, age, gender, genre, experience,
                main_image, concert_image, last_song, last_song_desc, updated_at
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows[0] || null;
    } catch (error) {
      console.error('Error in UsersModel.updateUser:', error);
      throw error;
    }
  },

  async deleteUser(username) {
    const query = `
      DELETE FROM users WHERE username = $1
      RETURNING id
    `;
    
    try {
      const { rows } = await pool.query(query, [username]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error in UsersModel.deleteUser:', error);
      throw error;
    }
  },

  async getNotificationPreferences(username) {
    const query = `
      SELECT notification_preferences FROM users WHERE username = $1
    `;
    try {
      const { rows } = await pool.query(query, [username]);
      return rows[0]?.notification_preferences || {};
    } catch (error) {
      console.error('Error in UsersModel.getNotificationPreferences:', error);
      throw error;
    }
  },

  async updateNotificationPreferences(username, preferences) {
    const query = `
      UPDATE users 
      SET notification_preferences = $1, updated_at = NOW()
      WHERE username = $2
      RETURNING notification_preferences
    `;
    try {
      const { rows } = await pool.query(query, [preferences, username]);
      return rows[0]?.notification_preferences || null;
    } catch (error) {
      console.error('Error in UsersModel.updateNotificationPreferences:', error);
      throw error;
    }
  }
};
