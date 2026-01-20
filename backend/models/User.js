// backend/models/User.js
import { pool } from "../db/index.js";

export async function createUser(email, passwordHash, username) {
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username)
       VALUES ($1, $2, $3)
       RETURNING id, email, username`,
      [email, passwordHash, username]
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB error in createUser:", err);
    throw err; //pass it up to route
  }
}

export async function findUserByEmail(email) {
  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, username
       FROM users
       WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB error in findUserByEmail:", err);
    throw err;
  }
}

