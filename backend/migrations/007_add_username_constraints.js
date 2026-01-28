"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add CHECK constraint for username format (alphanumeric and underscores only)
    const addUsernameCheckSQL = `
      ALTER TABLE users 
      ADD CONSTRAINT username_format 
      CHECK (username ~ '^[a-zA-Z0-9_]+$')
    `;

    // Email uniqueness constraint
    const addEmailUniqueSQL = `
      ALTER TABLE users 
      ADD CONSTRAINT unique_email 
      UNIQUE (email)
    `;

    await queryInterface.sequelize.query(addUsernameCheckSQL);
    await queryInterface.sequelize.query(addEmailUniqueSQL);
  },

  async down(queryInterface) {
    const dropConstraintsSQL = `
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS username_format,
      DROP CONSTRAINT IF EXISTS unique_email
    `;

    await queryInterface.sequelize.query(dropConstraintsSQL);
  },
};
