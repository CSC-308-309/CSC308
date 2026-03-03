"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createInteractionsSQL = `
      CREATE TABLE interactions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        target_user_id BIGINT NOT NULL,
        interaction_type VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (target_user_id) REFERENCES users(id),
        UNIQUE (user_id, target_user_id, interaction_type)
      )
    `;

    const createIndexSQL = `
      CREATE INDEX idx_interactions_user_target_type
        ON interactions (user_id, target_user_id, interaction_type)
    `;

    await queryInterface.sequelize.query(createInteractionsSQL);
    await queryInterface.sequelize.query(createIndexSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DROP TABLE IF EXISTS interactions CASCADE",
    );
  },
};
