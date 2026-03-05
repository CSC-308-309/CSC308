export async function up(queryInterface) {
  const createUsersSQL = `
    CREATE TABLE IF NOT EXISTS users (
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
      main_image VARCHAR(255),
      concert_image VARCHAR(255),
      last_song VARCHAR(255),
      last_song_desc TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
    )
  `;

  await queryInterface.sequelize.query(createUsersSQL);
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query("DROP TABLE IF EXISTS users CASCADE");
}
