
const { Sequelize } = require('sequelize');

// Database connection
const sequelize = new Sequelize(process.env.DEVELOPMENT_CONNECTION_STRING);

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Load and execute the migration
    const migration = require('/Users/yivanova/CSC308/backend/db/schema/001_create_users_table.js');
    await migration.up({ sequelize: { query: (sql) => sequelize.query(sql) } }, Sequelize);
    
    console.log('Migration completed successfully');
    await sequelize.close();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
