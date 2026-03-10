export async function up(queryInterface) {
  const createConcertMemoriesSQL = `
    CREATE TABLE concert_memories (
      id BIGSERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      thumbnail_url VARCHAR(255),
      video_url VARCHAR(255),
      is_starred BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  const createConcertMemoriesIntermediateSQL =`
    CREATE TABLE concert_memories_intermediate (
      id BIGSERIAL PRIMARY KEY,
      concert_memory_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      FOREIGN KEY (concert_memory_id) REFERENCES concert_memories(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE (concert_memory_id, user_id)
    )
  `;

  await queryInterface.sequelize.query(createConcertMemoriesSQL);
  await queryInterface.sequelize.query(createConcertMemoriesIntermediateSQL);
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query("DROP TABLE IF EXISTS concert_memories_intermediate CASCADE");
  await queryInterface.sequelize.query("DROP TABLE IF EXISTS concert_memories CASCADE");
}
