import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import pool from './index.js';

async function runAll() {
  try {
    console.log(' Running all schema files in order...');
    
    const schemaFiles = [
      '001_create_users_table.cjs',
      '002_create_interactions_table.cjs', 
      '003_create_messages_system.cjs',
      '004_create_notifications_table.cjs'
    ];
    
    for (const file of schemaFiles) {
      console.log(`Running ${file}...`);
      try {
        const schema = require(`./schema/${file}`);
        await schema.up({ sequelize: { query: (sql) => pool.query(sql) } });
        console.log(`${file} completed`);
      } catch (error) {
        console.error(`Error in ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('All schema files executed successfully!');
  } catch (error) {
    console.error('Error running schema files:', error);
    process.exit(1);
  }
}

async function downAll() {
  try {
    console.log('Dropping all schema files in reverse order...');
    
    const schemaFiles = [
      '004_create_notifications_table.cjs',
      '003_create_messages_system.cjs',
      '002_create_interactions_table.cjs', 
      '001_create_users_table.cjs'
    ];
    
    for (const file of schemaFiles) {
      console.log(`Running down for ${file}...`);
      const schema = require(`./schema/${file}`);
      await schema.down({ sequelize: { query: (sql) => pool.query(sql) } });
      console.log(`${file} down completed`);
    }
    
    console.log('All schema files dropped successfully!');
  } catch (error) {
    console.error('Error dropping schema files:', error);
    process.exit(1);
  }
}

const command = process.argv[2];

if (command === 'up') {
  runAll();
} else if (command === 'down') {
  downAll();
} else {
  console.log('Usage: node run-all.js [up|down]');
  process.exit(1);
}
