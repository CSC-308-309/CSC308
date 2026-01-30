// backend/models/User.js
import { pool } from "../db/index.js";

export async function createUser(email, passwordHash, username) {
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username)
       VALUES ($1, $2, $3)
       RETURNING username, email`,
      [email, passwordHash, username],
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB error in createUser:", err);
    throw err;
  }
}

export async function findUserByEmail(email) {
  try {
    const result = await pool.query(
      `SELECT username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email],
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB error in findUserByEmail:", err);
    throw err;
  }
}
