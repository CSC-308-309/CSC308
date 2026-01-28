// models/Users.js
import pool from '../db/index.js';
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
      UNION
      SELECT username FROM profiles WHERE username = $1
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
  }
};