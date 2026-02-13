"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createUsersSQL = `
      CREATE TABLE users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(255),
        age INTEGER,
        gender VARCHAR(255),
        genre VARCHAR(255),
        experience INTEGER,
        profile_picture VARCHAR(255),
        cover_photo VARCHAR(255),
        main_image VARCHAR(255),
        concert_image VARCHAR(255),
        concert_images VARCHAR(255)[],
        music_clips VARCHAR(255)[],
        last_song VARCHAR(255),
        last_song_desc TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
      )
    `;

    await queryInterface.sequelize.query(createUsersSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS users CASCADE');
  },
};
