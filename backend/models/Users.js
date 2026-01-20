// models/Users.js
import pool from '../db/index.js';
import bcrypt from 'bcrypt';

export const UsersModel = {
  async validateUser(username, password) {
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