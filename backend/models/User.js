// backend/models/User.js
import { pool } from "../db/index.js";

export async function createUser(email, passwordHash, username) {
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username)
       VALUES ($1, $2, $3)
<<<<<<< HEAD
       RETURNING username, email`,
      [email, passwordHash, username],
=======
       RETURNING id, email, username`,
      [email, passwordHash, username]
>>>>>>> a809449 (Trying to update with messages)
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB error in createUser:", err);
<<<<<<< HEAD
    throw err;
=======
    throw err; //pass it up to route
>>>>>>> a809449 (Trying to update with messages)
  }
}

export async function findUserByEmail(email) {
  try {
    const result = await pool.query(
<<<<<<< HEAD
      `SELECT username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email],
=======
      `SELECT id, email, password_hash, username
       FROM users
       WHERE email = $1`,
      [email]
>>>>>>> a809449 (Trying to update with messages)
    );
    return result.rows[0];
  } catch (err) {
    console.error("DB error in findUserByEmail:", err);
    throw err;
  }
}
<<<<<<< HEAD
=======

>>>>>>> a809449 (Trying to update with messages)
