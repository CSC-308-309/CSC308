import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const { Pool } = pkg;

// get DB_TYPE from environment
const dbType = process.env.DB_TYPE || 'PRODUCTION';

const connectionStringKey = `${dbType}_CONNECTION_STRING`;
const connectionString = process.env[connectionStringKey];

if (!connectionString) {
  throw new Error(`Missing environment variable: ${connectionStringKey}`);
}

console.log(`Using ${dbType} database connection`);

const poolConfig = { connectionString };

if (dbType === 'PRODUCTION') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new pkg.Pool(poolConfig);
export default pool;

export async function connectToDatabase() {
  try {
    const result = await pool.query('SELECT current_database(), current_user, version()');
    console.log(`Connected to ${dbType} database:`, result.rows[0].current_database);
    return pool;
  } catch (err) {
    console.error(`Failed to connect to ${dbType} database:`, err.message);
    throw err;
  }
}