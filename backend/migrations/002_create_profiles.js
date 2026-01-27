"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createTableSQL = `
      CREATE TABLE profiles (
        username VARCHAR(255) PRIMARY KEY NOT NULL,
        name VARCHAR(255),
        role VARCHAR(255),
        age INTEGER,
        gender VARCHAR(255),
        genre VARCHAR(255),
        experience INTEGER,
        main_image VARCHAR(255),
        concert_image VARCHAR(255),
        last_song VARCHAR(255),
        last_song_desc TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    await queryInterface.sequelize.query(createTableSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE profiles');
  },
};
