import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS migrations (
      id BIGSERIAL PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;
  await pool.query(createTableSQL);
}

async function getExecutedMigrations() {
  const result = await pool.query('SELECT file_name FROM migrations ORDER BY executed_at');
  return result.rows.map(row => row.file_name);
}

async function recordMigration(fileName) {
  await pool.query('INSERT INTO migrations (file_name) VALUES ($1)', [fileName]);
}

async function removeMigration(fileName) {
  await pool.query('DELETE FROM migrations WHERE file_name = $1', [fileName]);
}

async function getNextMigration() {
  const files = fs.readdirSync(path.join(__dirname, 'schema'))
    .filter(f => f.endsWith('.js'))
    .sort();
  
  const executed = await getExecutedMigrations();
  return files.find(f => !executed.includes(f));
}

async function getLastMigration() {
  const result = await pool.query('SELECT file_name FROM migrations ORDER BY executed_at DESC LIMIT 1');
  return result.rows.length > 0 ? result.rows[0].file_name : null;
}

async function migrateUp() {
  try {
    await ensureMigrationsTable();
    
    const nextFile = await getNextMigration();
    if (!nextFile) {
      console.log('All migrations are up to date');
      return;
    }

    console.log(`Running migration: ${nextFile}`);
    const schema = await import(path.join(__dirname, 'schema', nextFile));
    
    try {
      await schema.up({ 
        sequelize: { 
          query: pool.query.bind(pool) 
        } 
      });
      
      await recordMigration(nextFile);
      console.log(`Migration completed: ${nextFile}`);
    } catch (error) {
      console.error(`Migration failed: ${nextFile}`);
      console.error(error);
      throw error;
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

async function migrateDown() {
  try {
    await ensureMigrationsTable();
    
    const lastFile = await getLastMigration();
    if (!lastFile) {
      console.log('No migrations to rollback');
      return;
    }

    console.log(`Rolling back migration: ${lastFile}`);
    const schema = await import(path.join(__dirname, 'schema', lastFile));
    
    try {
      await schema.down({ 
        sequelize: { 
          query: pool.query.bind(pool) 
        } 
      });
      
      await removeMigration(lastFile);
      console.log(`Migration rolled back: ${lastFile}`);
    } catch (error) {
      console.error(`Rollback failed: ${lastFile}`);
      console.error(error);
      throw error;
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

export { migrateUp, migrateDown };
