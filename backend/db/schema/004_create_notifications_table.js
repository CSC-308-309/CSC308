"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const createNotificationsSQL = `
      CREATE TABLE notifications (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,              -- who receives notification
        actor_user_id BIGINT,                  -- who caused it (optional)
        type VARCHAR(50) NOT NULL,             -- message, request, like, etc.
        reference_id BIGINT,                   -- e.g., message_id, interaction_id
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
        read_at TIMESTAMP WITHOUT TIME ZONE NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (actor_user_id) REFERENCES users(id)
      )
    `;

    const createIndexSQL = `
      CREATE INDEX idx_notifications_user_read
        ON notifications (user_id, is_read)
    `;

    await queryInterface.sequelize.query(createNotificationsSQL);
    await queryInterface.sequelize.query(createIndexSQL);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DROP TABLE IF EXISTS notifications CASCADE",
    );
  },
};
