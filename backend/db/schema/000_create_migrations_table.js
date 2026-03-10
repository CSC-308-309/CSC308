export async function up(queryInterface) {
  const createMigrationsTableSQL = `
    CREATE TABLE migrations (
      id BIGSERIAL PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT now()
    )
  `;

  await queryInterface.sequelize.query(createMigrationsTableSQL);
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query("DROP TABLE IF EXISTS migrations CASCADE");
}
