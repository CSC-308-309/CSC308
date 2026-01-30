// models/Notifications.js

import pool from "../db/index.js";

// Minimal implementation to support the routes already in app.js 
// Assumes a "notifications" table exists. If you don't have one yet, see the SQL section below.

export const NotificationsModel = {
  async listNotifications(username) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE username = $1
      ORDER BY created_at DESC
      `,
      [username]
    );
    return rows;
  },

  async getUnreadNotificationsCount(username) {
    const { rows } = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM notifications
      WHERE username = $1 AND is_read = false
      `,
      [username]
    );
    return rows[0]?.count ?? 0;
  },

  async getNotification(notificationId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE id = $1
      `,
      [notificationId]
    );
    return rows[0] ?? null;
  },

  async createNotification(data) {
    const {
      username,
      type = null,
      message = null,
      link = null,
    } = data || {};

    if (!username) {
      throw new Error("username is required to create a notification");
    }

    const { rows } = await pool.query(
      `
      INSERT INTO notifications (username, type, message, link, is_read, is_archived)
      VALUES ($1, $2, $3, $4, false, false)
      RETURNING *
      `,
      [username, type, message, link]
    );

    return rows[0];
  },

  async markNotificationRead(notificationId) {
    const { rows } = await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1
      RETURNING *
      `,
      [notificationId]
    );
    return rows[0] ?? null;
  },

  async markNotificationUnread(notificationId) {
    const { rows } = await pool.query(
      `
      UPDATE notifications
      SET is_read = false
      WHERE id = $1
      RETURNING *
      `,
      [notificationId]
    );
    return rows[0] ?? null;
  },

  async markAllNotificationsRead(body) {
    const username = body?.username ?? body?.user?.username;
    if (!username) throw new Error("username is required");

    await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE username = $1 AND is_read = false
      `,
      [username]
    );

    return { success: true };
  },

  async archiveNotification(notificationId) {
    const { rows } = await pool.query(
      `
      UPDATE notifications
      SET is_archived = true
      WHERE id = $1
      RETURNING *
      `,
      [notificationId]
    );
    return rows[0] ?? null;
  },

  async unarchiveNotification(notificationId) {
    const { rows } = await pool.query(
      `
      UPDATE notifications
      SET is_archived = false
      WHERE id = $1
      RETURNING *
      `,
      [notificationId]
    );
    return rows[0] ?? null;
  },

  async deleteNotification(notificationId) {
    const { rowCount } = await pool.query(
      `
      DELETE FROM notifications
      WHERE id = $1
      `,
      [notificationId]
    );
    return rowCount > 0;
  },
};
