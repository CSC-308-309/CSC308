// // models/Notifications.js

// import pool from "../db/index.js";

// // Minimal implementation to support the routes already in app.js 
// // Assumes a "notifications" table exists. If you don't have one yet, see the SQL section below.

// export const NotificationsModel = {
//   async listNotifications(username) {
//     const { rows } = await pool.query(
//       `
//       SELECT *
//       FROM notifications
//       WHERE username = $1
//       ORDER BY created_at DESC
//       `,
//       [username]
//     );
//     return rows;
//   },

//   async getUnreadNotificationsCount(username) {
//     const { rows } = await pool.query(
//       `
//       SELECT COUNT(*)::int AS count
//       FROM notifications
//       WHERE username = $1 AND is_read = false
//       `,
//       [username]
//     );
//     return rows[0]?.count ?? 0;
//   },

//   async getNotification(notificationId) {
//     const { rows } = await pool.query(
//       `
//       SELECT *
//       FROM notifications
//       WHERE id = $1
//       `,
//       [notificationId]
//     );
//     return rows[0] ?? null;
//   },

//   async createNotification(data) {
//     const {
//       username,
//       type = null,
//       message = null,
//       link = null,
//     } = data || {};

//     if (!username) {
//       throw new Error("username is required to create a notification");
//     }

//     const { rows } = await pool.query(
//       `
//       INSERT INTO notifications (username, type, message, link, is_read, is_archived)
//       VALUES ($1, $2, $3, $4, false, false)
//       RETURNING *
//       `,
//       [username, type, message, link]
//     );

//     return rows[0];
//   },

//   async markNotificationRead(notificationId) {
//     const { rows } = await pool.query(
//       `
//       UPDATE notifications
//       SET is_read = true
//       WHERE id = $1
//       RETURNING *
//       `,
//       [notificationId]
//     );
//     return rows[0] ?? null;
//   },

//   async markNotificationUnread(notificationId) {
//     const { rows } = await pool.query(
//       `
//       UPDATE notifications
//       SET is_read = false
//       WHERE id = $1
//       RETURNING *
//       `,
//       [notificationId]
//     );
//     return rows[0] ?? null;
//   },

//   async markAllNotificationsRead(body) {
//     const username = body?.username ?? body?.user?.username;
//     if (!username) throw new Error("username is required");

//     await pool.query(
//       `
//       UPDATE notifications
//       SET is_read = true
//       WHERE username = $1 AND is_read = false
//       `,
//       [username]
//     );

//     return { success: true };
//   },

//   async archiveNotification(notificationId) {
//     const { rows } = await pool.query(
//       `
//       UPDATE notifications
//       SET is_archived = true
//       WHERE id = $1
//       RETURNING *
//       `,
//       [notificationId]
//     );
//     return rows[0] ?? null;
//   },

//   async unarchiveNotification(notificationId) {
//     const { rows } = await pool.query(
//       `
//       UPDATE notifications
//       SET is_archived = false
//       WHERE id = $1
//       RETURNING *
//       `,
//       [notificationId]
//     );
//     return rows[0] ?? null;
//   },

//   async deleteNotification(notificationId) {
//     const { rowCount } = await pool.query(
//       `
//       DELETE FROM notifications
//       WHERE id = $1
//       `,
//       [notificationId]
//     );
//     return rowCount > 0;
//   },
// };

// NOTE: THIS IS A MOCK IMPLEMENTATION FOR TESTING
// REPLACE ALL MOCK DATA USES WITH ACTUAL DATABASE QUERIES
// Note: Used AI to generate mock data because that would be a pain to write myself

const NotificationsModel = {
  // Mock data for testing
  mockNotifications: [
    {
      id: '1',
      username: 'currentUser',
      type: 'match',
      message: 'You matched with Alice Johnson!',
      link: '/messages/1',
      is_read: false,
      is_archived: false,
      created_at: new Date('2025-01-20T10:30:00').toISOString(),
    },
    {
      id: '2',
      username: 'currentUser',
      type: 'message',
      message: 'Bob Smith sent you a message',
      link: '/messages/2',
      is_read: false,
      is_archived: false,
      created_at: new Date('2025-01-19T14:15:00').toISOString(),
    },
    {
      id: '3',
      username: 'currentUser',
      type: 'event',
      message: 'Concert at The Fillmore starts in 2 hours!',
      link: '/events/123',
      is_read: true,
      is_archived: false,
      created_at: new Date('2025-01-18T18:00:00').toISOString(),
    },
    {
      id: '4',
      username: 'currentUser',
      type: 'like',
      message: 'Someone liked your profile!',
      link: '/profile',
      is_read: true,
      is_archived: false,
      created_at: new Date('2025-01-17T12:45:00').toISOString(),
    },
    {
      id: '5',
      username: 'otherUser',
      type: 'message',
      message: 'You have a new message',
      link: '/messages/3',
      is_read: false,
      is_archived: false,
      created_at: new Date('2025-01-16T09:20:00').toISOString(),
    },
  ],

  async listNotifications(username) {
    console.log(`[NOTIFICATIONS] listNotifications called for username: ${username}`);
    // Returns array of notifications for the given user, ordered by newest first
    const result = this.mockNotifications
      .filter(n => n.username === username)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    console.log(`   → Returning ${result.length} notifications`);
    return result;
  },

  async getUnreadNotificationsCount(username) {
    console.log(`[NOTIFICATIONS] getUnreadNotificationsCount called for username: ${username}`);
    // Returns the count of unread notifications for the given user
    const count = this.mockNotifications.filter(
      n => n.username === username && n.is_read === false
    ).length;
    console.log(`   → Returning count: ${count}`);
    return count;
  },

  async getNotification(notificationId) {
    console.log(`[NOTIFICATIONS] getNotification called for notificationId: ${notificationId}`);
    // Returns a single notification by ID
    const result = this.mockNotifications.find(n => n.id === notificationId) || null;
    console.log(`   → Found: ${result ? 'yes' : 'no'}`);
    return result;
  },

  async createNotification(data) {
    console.log(`[NOTIFICATIONS] createNotification called with:`, data);
    // Expected input: { username, type?, message?, link? }
    // Expected output: new notification object
    const { username, type = null, message = null, link = null } = data || {};

    if (!username) {
      throw new Error('username is required to create a notification');
    }

    const newNotification = {
      id: `notif-${Date.now()}`,
      username,
      type,
      message,
      link,
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
    };

    this.mockNotifications.push(newNotification);
    console.log(`   → Created notification with id: ${newNotification.id}`);
    return newNotification;
  },

  async markNotificationRead(notificationId) {
    console.log(`[NOTIFICATIONS] markNotificationRead called for notificationId: ${notificationId}`);
    // Marks a notification as read
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      console.log(`   → Notification not found`);
      return null;
    }
    notification.is_read = true;
    console.log(`   → Marked as read`);
    return notification;
  },

  async markNotificationUnread(notificationId) {
    console.log(`[NOTIFICATIONS] markNotificationUnread called for notificationId: ${notificationId}`);
    // Marks a notification as unread
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      console.log(`   → Notification not found`);
      return null;
    }
    notification.is_read = false;
    console.log(`   → Marked as unread`);
    return notification;
  },

  async markAllNotificationsRead(body) {
    console.log(`[NOTIFICATIONS] markAllNotificationsRead called with:`, body);
    // Marks all notifications as read for a given user
    const username = body?.username ?? body?.user?.username;
    if (!username) throw new Error('username is required');

    const updated = this.mockNotifications
      .filter(n => n.username === username && n.is_read === false)
      .map(n => {
        n.is_read = true;
        return n;
      });

    console.log(`   → Marked ${updated.length} notifications as read`);
    return { success: true };
  },

  async archiveNotification(notificationId) {
    console.log(`[NOTIFICATIONS] archiveNotification called for notificationId: ${notificationId}`);
    // Archives a notification
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      console.log(`   → Notification not found`);
      return null;
    }
    notification.is_archived = true;
    console.log(`   → Archived`);
    return notification;
  },

  async unarchiveNotification(notificationId) {
    console.log(`[NOTIFICATIONS] unarchiveNotification called for notificationId: ${notificationId}`);
    // Unarchives a notification
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (!notification) {
      console.log(`   → Notification not found`);
      return null;
    }
    notification.is_archived = false;
    console.log(`   → Unarchived`);
    return notification;
  },

  async deleteNotification(notificationId) {
    console.log(`[NOTIFICATIONS] deleteNotification called for notificationId: ${notificationId}`);
    // Deletes a notification
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (index === -1) {
      console.log(`   → Notification not found`);
      return false;
    }
    this.mockNotifications.splice(index, 1);
    console.log(`   → Deleted successfully`);
    return true;
  },
};

export { NotificationsModel };




