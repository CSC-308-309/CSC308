const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

async function connectToDatabase() {
  const result = await pool.query('SELECT current_database(), current_user, version()');
  console.log('✅ Connected to database:', result.rows[0].current_database);
  return pool;
}

module.exports = {
  pool,
  connectToDatabase
};