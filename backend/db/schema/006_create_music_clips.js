export async function up(queryInterface) {
  const createMusicClipsSQL = `
    CREATE TABLE IF NOT EXISTS music_clips (
      id BIGSERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      thumbnail_url VARCHAR(255),
      media_url VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  const createMusicClipsIntermediateSQL =`
    CREATE TABLE IF NOT EXISTS music_clips_intermediate (
      id BIGSERIAL PRIMARY KEY,
      music_clip_id BIGINT NOT NULL,
      user_id BIGINT NOT NULL,
      FOREIGN KEY (music_clip_id) REFERENCES music_clips(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE (music_clip_id, user_id)
    )
  `;

  await queryInterface.sequelize.query(createMusicClipsSQL);
  await queryInterface.sequelize.query(createMusicClipsIntermediateSQL);
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query("DROP TABLE IF EXISTS music_clips_intermediate CASCADE");
  await queryInterface.sequelize.query("DROP TABLE IF EXISTS music_clips CASCADE");
}
