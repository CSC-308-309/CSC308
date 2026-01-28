import pool from '../db/index.js';

const MessagesModel = {

    async listChats(username, queryParams = {}) {
        const { limit = 50, offset = 0, search } = queryParams;
        
        let whereClause = 'cp.username = $1';
        let queryParamsArray = [username, limit, offset];
        
        if (search) {
            whereClause += ' AND (c.name ILIKE $4 OR p.name ILIKE $4)';
            queryParamsArray.splice(2, 0, `%${search}%`);
        }
        
        const query = `
            SELECT DISTINCT 
                c.id,
                c.type,
                c.name,
                c.avatar_url,
                m.text as last_message,
                m.created_at as last_message_at,
                COUNT(CASE WHEN m.sender_username != $1 THEN 1 END) as unread_count
            FROM chats c
            JOIN chat_participants cp ON c.id = cp.chat_id
            LEFT JOIN messages m ON c.id = m.chat_id 
                AND m.id = (
                    SELECT MAX(id) FROM messages WHERE chat_id = c.id
                )
            LEFT JOIN profiles p ON (
                c.type = 'dm' AND 
                p.username = (
                    SELECT username FROM chat_participants 
                    WHERE chat_id = c.id AND username != $1 LIMIT 1
                )
            )
            WHERE ${whereClause}
            GROUP BY c.id, m.text, m.created_at
            ORDER BY m.created_at DESC NULLS LAST, c.created_at DESC
            LIMIT $${queryParamsArray.length - 1} OFFSET $${queryParamsArray.length}
        `;
        
        try {
            const { rows } = await pool.query(query, queryParamsArray);
            return rows;
        } catch (error) {
            console.error('Error in MessagesModel.listChats:', error);
            throw error;
        }
    },

    async createChat(username, chatData) {
        const { type, participant_usernames, name } = chatData;
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Create chat
            const chatQuery = `
                INSERT INTO chats (type, name, created_by)
                VALUES ($1, $2, $3)
                RETURNING id, type, name, created_by, created_at
            `;
            const chatResult = await client.query(chatQuery, [type, name, username]);
            const chat = chatResult.rows[0];
            
            // Add participants
            const participants = [username, ...(participant_usernames || [])];
            const participantQuery = `
                INSERT INTO chat_participants (chat_id, username)
                VALUES ($1, $2)
            `;
            
            for (const participant of participants) {
                await client.query(participantQuery, [chat.id, participant]);
            }
            
            await client.query('COMMIT');
            return chat;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in MessagesModel.createChat:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    async getChat(username, chatId) {
        const query = `
            SELECT 
                c.id, c.type, c.name, c.avatar_url, c.created_by, c.created_at,
                array_agg(cp.username) as participants
            FROM chats c
            JOIN chat_participants cp ON c.id = cp.chat_id
            WHERE c.id = $1 AND EXISTS (
                SELECT 1 FROM chat_participants 
                WHERE chat_id = $1 AND username = $2
            )
            GROUP BY c.id
        `;
        
        try {
            const { rows } = await pool.query(query, [chatId, username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in MessagesModel.getChat:', error);
            throw error;
        }
    },

    async updateChat(username, chatId, updateData) {
        const { name, avatar_url } = updateData;
        const fields = [];
        const values = [chatId, username];
        let paramCount = 3;
        
        if (name !== undefined) {
            fields.push(`name = $${paramCount++}`);
            values.push(name);
        }
        if (avatar_url !== undefined) {
            fields.push(`avatar_url = $${paramCount++}`);
            values.push(avatar_url);
        }
        
        if (fields.length === 0) return null;
        
        const query = `
            UPDATE chats 
            SET ${fields.join(', ')}, updated_at = NOW()
            WHERE id = $1 AND created_by = $2
            RETURNING id, type, name, avatar_url, updated_at
        `;
        
        try {
            const { rows } = await pool.query(query, values);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in MessagesModel.updateChat:', error);
            throw error;
        }
    },

    async deleteOrLeaveChat(username, chatId) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const participantCheck = await client.query(
                'SELECT 1 FROM chat_participants WHERE chat_id = $1 AND username = $2',
                [chatId, username]
            );
            
            if (participantCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return false;
            }
            
            const creatorCheck = await client.query(
                'SELECT created_by FROM chats WHERE id = $1',
                [chatId]
            );
            
            if (creatorCheck.rows[0]?.created_by === username) {
                await client.query('DELETE FROM chats WHERE id = $1', [chatId]);
            } else {
                await client.query(
                    'DELETE FROM chat_participants WHERE chat_id = $1 AND username = $2',
                    [chatId, username]
                );
            }
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in MessagesModel.deleteOrLeaveChat:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    async listParticipants(username, chatId) {
        const query = `
            SELECT p.username, p.name, p.main_image as avatar_url
            FROM chat_participants cp
            JOIN profiles p ON cp.username = p.username
            WHERE cp.chat_id = $1 AND EXISTS (
                SELECT 1 FROM chat_participants 
                WHERE chat_id = $1 AND username = $2
            )
            ORDER BY cp.joined_at
        `;
        
        try {
            const { rows } = await pool.query(query, [chatId, username]);
            return rows;
        } catch (error) {
            console.error('Error in MessagesModel.listParticipants:', error);
            throw error;
        }
    },

    async addParticipants(username, chatId, usernames) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const permissionCheck = await client.query(
                'SELECT 1 FROM chat_participants WHERE chat_id = $1 AND username = $2',
                [chatId, username]
            );
            
            if (permissionCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;
            }
            
            const insertQuery = `
                INSERT INTO chat_participants (chat_id, username)
                VALUES ($1, $2)
                ON CONFLICT (chat_id, username) DO NOTHING
                RETURNING username
            `;
            
            const addedParticipants = [];
            for (const participantUsername of usernames) {
                const result = await client.query(insertQuery, [chatId, participantUsername]);
                if (result.rows.length > 0) {
                    addedParticipants.push(participantUsername);
                }
            }
            
            await client.query('COMMIT');
            return addedParticipants;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error in MessagesModel.addParticipants:', error);
            throw error;
        } finally {
            client.release();
        }
    },

    async removeParticipant(username, chatId, targetUsername) {
        const query = `
            DELETE FROM chat_participants 
            WHERE chat_id = $1 AND username = $2
            AND EXISTS (
                SELECT 1 FROM chat_participants 
                WHERE chat_id = $1 AND username = $3
            )
            RETURNING username
        `;
        
        try {
            const { rows } = await pool.query(query, [chatId, targetUsername, username]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error in MessagesModel.removeParticipant:', error);
            throw error;
        }
    },

    async listMessages(username, chatId, queryParams = {}) {
        const { limit = 50, offset = 0 } = queryParams;
        
        const query = `
            SELECT m.id, m.chat_id, m.sender_username, m.text, 
                   m.client_message_id, m.created_at, m.edited_at,
                   p.name as sender_name
            FROM messages m
            JOIN profiles p ON m.sender_username = p.username
            WHERE m.chat_id = $1 AND EXISTS (
                SELECT 1 FROM chat_participants 
                WHERE chat_id = $1 AND username = $2
            )
            ORDER BY m.created_at ASC
            LIMIT $3 OFFSET $4
        `;
        
        try {
            const { rows } = await pool.query(query, [chatId, username, limit, offset]);
            return rows;
        } catch (error) {
            console.error('Error in MessagesModel.listMessages:', error);
            throw error;
        }
    },

    async getMessage(username, chatId, messageId) {
        const query = `
            SELECT m.id, m.chat_id, m.sender_username, m.text, 
                   m.client_message_id, m.created_at, m.edited_at,
                   p.name as sender_name
            FROM messages m
            JOIN profiles p ON m.sender_username = p.username
            WHERE m.id = $1 AND m.chat_id = $2 AND EXISTS (
                SELECT 1 FROM chat_participants 
                WHERE chat_id = $2 AND username = $3
            )
        `;
        
        try {
            const { rows } = await pool.query(query, [messageId, chatId, username]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in MessagesModel.getMessage:', error);
            throw error;
        }
    },

    async sendMessage(username, chatId, text, clientMessageId) {
        const query = `
            INSERT INTO messages (chat_id, sender_username, text, client_message_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, chat_id, sender_username, text, created_at
        `;
        
        try {
            const { rows } = await pool.query(query, [chatId, username, text, clientMessageId]);
            return rows[0];
        } catch (error) {
            console.error('Error in MessagesModel.sendMessage:', error);
            throw error;
        }
    },

    async updateMessage(username, chatId, messageId, updateData) {
        const { text } = updateData;
        
        const query = `
            UPDATE messages 
            SET text = $4, edited_at = NOW()
            WHERE id = $1 AND chat_id = $2 AND sender_username = $3
            RETURNING id, text, edited_at
        `;
        
        try {
            const { rows } = await pool.query(query, [messageId, chatId, username, text]);
            return rows[0] || null;
        } catch (error) {
            console.error('Error in MessagesModel.updateMessage:', error);
            throw error;
        }
    },
    
    async deleteMessage(username, chatId, messageId) {
        const query = `
            DELETE FROM messages 
            WHERE id = $1 AND chat_id = $2 AND sender_username = $3
            RETURNING id
        `;
        
        try {
            const { rows } = await pool.query(query, [messageId, chatId, username]);
            return rows.length > 0;
        } catch (error) {
            console.error('Error in MessagesModel.deleteMessage:', error);
            throw error;
        }
    }
};

export { MessagesModel };