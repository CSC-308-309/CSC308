import pool from '../db/index.js';

const NotificationsModel = {
    async listNotificationsForUser(username, queryParams = {}) {
        const { limit = 50, offset = 0, type, is_read, is_archived } = queryParams;
        
        let whereClause = 'username = $1';
        let queryParamsArray = [username, limit, offset];
        let paramCount = 4;
        
        if (type !== undefined) {
            whereClause += ` AND type = $${paramCount++}`;
            queryParamsArray.push(type);
        }
        if (is_read !== undefined) {
            whereClause += ` AND is_read = $${paramCount++}`;
            queryParamsArray.push(is_read);
        }
        if (is_archived !== undefined) {
            whereClause += ` AND is_archived = $${paramCount++}`;
            queryParamsArray.push(is_archived);
        }
        
        const query = `
            SELECT id, type, title, content, data, is_read, is_archived, created_at, updated_at
            FROM notifications
            WHERE ${whereClause}
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        try {
            const { rows } = await pool.query(query, queryParamsArray);
            return rows;
        } catch (error) {
            console.error('Error in NotificationsModel.listNotificationsForUser:', error);
            throw error;
        }
    },

    async getUnreadCount(username) {
        const query = `
            SELECT COUNT(*) as count
            FROM notifications
            WHERE username = $1 AND is_read = FALSE AND is_archived = FALSE
        `;
        
        try {
            const { rows } = await pool.query(query, [username]);
            return { count: parseInt(rows[0].count) };
        } catch (error) {
            console.error('Error in NotificationsModel.getUnreadCount:', error);
            throw error;
        }
    },

    async getNotification(username, notificationId) {
        const query = `
            SELECT id, type, title, content, data, is_read, is_archived, 
                   created_at, updated_at
            FROM notifications
            WHERE id = $1 AND username = $2
        `;
        
        try {
            const { rows } = await pool.query(query, [notificationId, username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in NotificationsModel.getNotification:', error);
            throw error;
        }
    },

    async markNotificationRead(username, notificationId) {
        const query = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = NOW()
            WHERE id = $1 AND username = $2
            RETURNING id, is_read, updated_at
        `;
        
        try {
            const { rows } = await pool.query(query, [notificationId, username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in NotificationsModel.markNotificationRead:', error);
            throw error;
        }
    },

    async markNotificationUnread(username, notificationId) {
        const query = `
            UPDATE notifications 
            SET is_read = FALSE, updated_at = NOW()
            WHERE id = $1 AND username = $2
            RETURNING id, is_read, updated_at
        `;
        
        try {
            const { rows } = await pool.query(query, [notificationId, username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in NotificationsModel.markNotificationUnread:', error);
            throw error;
        }
    },

    async markAllRead(username) {
        const query = `
            UPDATE notifications 
            SET is_read = TRUE, updated_at = NOW()
            WHERE username = $1 AND is_read = FALSE
            RETURNING id
        `;
        
        try {
            const { rows } = await pool.query(query, [username]);
            return { success: true, count: rows.length };
        } catch (error) {
            console.error('Error in NotificationsModel.markAllRead:', error);
            throw error;
        }
    },

    async archiveNotification(username, notificationId) {
        const query = `
            UPDATE notifications 
            SET is_archived = TRUE, updated_at = NOW()
            WHERE id = $1 AND username = $2
            RETURNING id, is_archived, updated_at
        `;
        
        try {
            const { rows } = await pool.query(query, [notificationId, username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in NotificationsModel.archiveNotification:', error);
            throw error;
        }
    },

    async unarchiveNotification(username, notificationId) {
        const query = `
            UPDATE notifications 
            SET is_archived = FALSE, updated_at = NOW()
            WHERE id = $1 AND username = $2
            RETURNING id, is_archived, updated_at
        `;
        
        try {
            const { rows } = await pool.query(query, [notificationId, username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in NotificationsModel.unarchiveNotification:', error);
            throw error;
        }
    },

    async deleteNotification(username, notificationId) {
        const query = `
            DELETE FROM notifications 
            WHERE id = $1 AND username = $2
            RETURNING id
        `;
        
        try {
            const { rows } = await pool.query(query, [notificationId, username]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error in NotificationsModel.deleteNotification:', error);
            throw error;
        }
    },

    // Helper function to create notifications
    async createNotification(username, notificationData) {
        const { type, title, content, data } = notificationData;
        
        const query = `
            INSERT INTO notifications (username, type, title, content, data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, type, title, content, data, is_read, is_archived, created_at
        `;
        
        try {
            const { rows } = await pool.query(query, [username, type, title, content, JSON.stringify(data)]);
            return rows[0];
        } catch (error) {
            console.error('Error in NotificationsModel.createNotification:', error);
            throw error;
        }
    }
};

export { NotificationsModel };
