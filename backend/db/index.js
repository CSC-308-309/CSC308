const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

// get DB_TYPE from environment
const dbType = process.env.DB_TYPE || 'PRODUCTION';

// construct the connection string var name: {DB_TYPE}_CONNECTION_STRING
const connectionStringKey = `${dbType}_CONNECTION_STRING`;
const connectionString = process.env[connectionStringKey];

if (!connectionString) {
  throw new Error(`Missing environment variable: ${connectionStringKey}. Please set DB_TYPE and ${connectionStringKey} in .env.`);
}

console.log(`Using ${dbType} database connection`);

// configure pool based on DB_TYPE
const poolConfig = {
  connectionString: connectionString,
};

// SSL for production databases 
if (dbType === 'PRODUCTION') {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = new Pool(poolConfig);

async function connectToDatabase() {
  try {
    const result = await pool.query('SELECT current_database(), current_user, version()');
    console.log(`Connected to ${dbType} database:`, result.rows[0].current_database);
    return pool;
  } catch (error) {
    console.error(`Failed to connect to ${dbType} database:`, error.message);
    throw error;
  }
}

module.exports = {
  pool,
  connectToDatabase
};