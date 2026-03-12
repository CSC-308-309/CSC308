// backend/models/Notifications.js
import pool from "../db/index.js";

function buildDisplayNotification(row) {
  const actor = row.actor_username || "System";

  let message = "";
  let link = "";

  switch (row.type) {
    case "like":
      message = "liked your profile.";
      link = actor !== "System" ? `/profile/${actor}` : "/profile";
      break;

    case "match":
      message = "matched with you.";
      link = actor !== "System" ? `/profile/${actor}` : "/profile";
      break;

    case "message":
      message = "sent you a message.";
      link = row.reference_id ? `/messages?chatId=${row.reference_id}` : "/messages";
      break;

    default:
      message = "triggered a notification.";
      link = "/notifications";
  }

  return {
    id: row.id,
    type: row.type,
    username: actor,           
    message,
    link,
    is_read: row.is_read,
    created_at: row.created_at,
    reference_id: row.reference_id ?? null,
  };
}

const NotificationsModel = {
  async listNotifications(username) {
    const query = `
      SELECT
        n.id, n.type, n.reference_id, n.is_read, n.created_at,
        actor.username AS actor_username
      FROM notifications n
      JOIN users recipient ON recipient.id = n.user_id
      LEFT JOIN users actor ON actor.id = n.actor_user_id
      WHERE recipient.username = $1
      ORDER BY n.created_at DESC
    `;
    const { rows } = await pool.query(query, [username]);
    return rows.map(buildDisplayNotification);
  },

  async getUnreadNotificationsCount(username) {
    const query = `
      SELECT COUNT(*)::int AS count
      FROM notifications n
      JOIN users u ON u.id = n.user_id
      WHERE u.username = $1 AND n.is_read = false
    `;
    const { rows } = await pool.query(query, [username]);
    return rows[0]?.count ?? 0;
  },

  async getNotification(notificationId) {
    const query = `
      SELECT
        n.id, n.type, n.reference_id, n.is_read, n.created_at,
        actor.username AS actor_username
      FROM notifications n
      LEFT JOIN users actor ON actor.id = n.actor_user_id
      WHERE n.id = $1
    `;
    const { rows } = await pool.query(query, [notificationId]);
    if (!rows[0]) return null;
    return buildDisplayNotification(rows[0]);
  },

  async createNotification(data) {
    const { username, actorUsername = null, type, referenceId = null } = data || {};
    if (!username) throw new Error("username (recipient) is required");
    if (!type) throw new Error("type is required");

    const query = `
      INSERT INTO notifications (user_id, actor_user_id, type, reference_id)
      VALUES (
        (SELECT id FROM users WHERE username = $1),
        (SELECT id FROM users WHERE username = $2),
        $3,
        $4
      )
      RETURNING id, type, reference_id, is_read, created_at
    `;

    const { rows } = await pool.query(query, [username, actorUsername, type, referenceId]);
    return {
      id: rows[0].id,
      type: rows[0].type,
      reference_id: rows[0].reference_id,
      is_read: rows[0].is_read,
      created_at: rows[0].created_at,
    };
  },

  async markNotificationRead(notificationId) {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = now()
      WHERE id = $1
      RETURNING id, is_read
    `;
    const { rows } = await pool.query(query, [notificationId]);
    return rows[0] || null;
  },

  async markNotificationUnread(notificationId) {
    const query = `
      UPDATE notifications
      SET is_read = false, read_at = NULL
      WHERE id = $1
      RETURNING id, is_read
    `;
    const { rows } = await pool.query(query, [notificationId]);
    return rows[0] || null;
  },

  async markAllNotificationsRead(body) {
    const username = body?.username ?? body?.user?.username;
    if (!username) throw new Error("username is required");

    const query = `
      UPDATE notifications
      SET is_read = true, read_at = now()
      WHERE user_id = (SELECT id FROM users WHERE username = $1)
        AND is_read = false
    `;
    await pool.query(query, [username]);
    return { success: true };
  },

  async deleteNotification(notificationId) {
    const query = `DELETE FROM notifications WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [notificationId]);
    return rows.length > 0;
  },
};

export { NotificationsModel };
