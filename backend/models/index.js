const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});

const pool = new Pool({
  connectionString: process.env.DATABASE_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT current_database(), current_user, version()");
    console.log('Database info:', res.rows[0]);
    client.release();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = { pool };