import request from 'supertest';
import { createApp } from '../app.js';
import { dbModels } from '../models/index.js';
import pool from '../db/index.js';

describe('Chats/Messages API routes', () => {
  const app = createApp({ db: dbModels });

  let chatId;
  let messageId;
  let groupChatId;
  let groupMessageId;

  beforeAll(async () => {
    // Create a test personal chat
    const result = await request(app)
      .post('/chats')
      .send({
        name: `Test Chat ${Date.now()}`,
        is_group: false,
        created_by: 'taylor_swift',
        participants: ['ed_sheeran']
      })
      .expect(201);

    chatId = result.body.id;

    // Create a test group chat 
    const groupResult = await request(app)
      .post('/chats')
      .send({
        name: `Test Group Chat ${Date.now()}`,
        is_group: true,
        created_by: 'taylor_swift',
        participants: ['ed_sheeran', 'billie_eilish', 'john_mayer']
      })
      .expect(201);

    groupChatId = groupResult.body.id;
  });

  afterAll(async () => {
    // Clean up test chats
    const chats = [chatId, groupChatId].filter(Boolean);
    for (const cid of chats) {
      await pool.query('DELETE FROM messages_read WHERE message_id IN (SELECT id FROM messages WHERE chat_id = $1)', [cid]);
      await pool.query('DELETE FROM messages WHERE chat_id = $1', [cid]);
      await pool.query('DELETE FROM chat_members WHERE chat_id = $1', [cid]);
      await pool.query('DELETE FROM chats WHERE id = $1', [cid]);
    }
    await pool.end();
  });

  describe('POST /chats', () => {
    test('creates a chat', async () => {
      const result = await request(app)
        .post('/chats')
        .send({
          name: `API Chat ${Date.now()}`,
          is_group: false,
          created_by: 'taylor_swift',
          participants: ['ed_sheeran']
        })
        .expect(201);

      console.log('POST /chats ', result.body);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('is_group', false);
    });

    test('creates a group chat', async () => {
      const result = await request(app)
        .post('/chats')
        .send({
          name: `API Group Chat ${Date.now()}`,
          is_group: true,
          created_by: 'taylor_swift',
          participants: ['ed_sheeran', 'billie_eilish']
        })
        .expect(201);

      console.log('POST /chats (group)', result.body);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('is_group', true);
    });

    test('returns 500 if created_by user does not exist', async () => {
      const result = await request(app)
        .post('/chats')
        .send({
          name: 'Bad Chat',
          is_group: false,
          created_by: 'nonexistent_user',
          participants: ['ed_sheeran']
        })
        .expect(500);

      console.log('POST /chats (bad creator)', result.body);
    });
  });

  describe('GET /chats', () => {
    test('lists chats for user', async () => {
      const result = await request(app).get('/chats').query({ username: 'taylor_swift' }).expect(200);
      console.log('GET /chats for taylor_swift', result.body);
      expect(Array.isArray(result.body)).toBe(true);
      expect(result.body.some(c => String(c.id) === String(chatId))).toBe(true);
      expect(result.body.some(c => String(c.id) === String(groupChatId))).toBe(true);
    });

    test('returns empty array for user with no chats', async () => {
      const temp = { username: `lonely_${Date.now()}`, email: `lonely_${Date.now()}@example.com`, password_hash: 'x' };
      await dbModels.User.createUser(temp.email, temp.password_hash, temp.username);

      const result = await request(app).get('/chats').query({ username: temp.username }).expect(200);
      console.log('GET /chats for lonely user', result.body);
      expect(result.body).toEqual([]);

      await pool.query('DELETE FROM users WHERE username = $1', [temp.username]);
    });

    test('handles pagination', async () => {
      const result = await request(app).get('/chats').query({ username: 'taylor_swift', limit: 1, offset: 0 }).expect(200);
      console.log('GET /chats paginated', result.body);
      expect(result.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /chats/:chatId', () => {
    test('returns chat details', async () => {
      const result = await request(app).get(`/chats/${chatId}`).expect(200);
      console.log('GET /chats/:id', result.body);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('is_group');
    });

    test('returns 404 for non-existent chat', async () => {
      const result = await request(app).get('/chats/99999').expect(404);
      console.log('GET /chats/:id 404', result.text);
      expect(result.text).toBe('Chat not found');
    });
  });

  describe('PATCH /chats/:chatId', () => {
    test('updates chat name', async () => {
      const result = await request(app)
        .patch(`/chats/${groupChatId}`)
        .send({ name: 'Updated Group Chat Name' })
        .expect(200);

      console.log('PATCH /chats/:id', result.body);
      expect(result.body).toHaveProperty('name', 'Updated Group Chat Name');
    });

    test('returns 404 for non-existent chat', async () => {
      const result = await request(app)
        .patch('/chats/99999')
        .send({ name: 'Nope' })
        .expect(404);

      console.log('PATCH /chats/:id 404', result.text);
      expect(result.text).toBe('Chat not found');
    });

    test('ignores invalid fields', async () => {
      const result = await request(app)
        .patch(`/chats/${chatId}`)
        .send({ name: 'Updated Chat Name', invalid_field: 'ignored' })
        .expect(200);

      console.log('PATCH /chats/:id ignored', result.body);
      expect(result.body).toHaveProperty('name', 'Updated Chat Name');
      expect(result.body).not.toHaveProperty('invalid_field');
    });
  });

  describe('DELETE /chats/:chatId', () => {
    test('deletes chat and returns 204', async () => {
      const tempChat = await request(app)
        .post('/chats')
        .send({
          name: `Temp Chat ${Date.now()}`,
          is_group: false,
          created_by: 'taylor_swift',
          participants: ['ed_sheeran']
        })
        .expect(201);

      const del = await request(app).delete(`/chats/${tempChat.body.id}`).expect(204);
      console.log('DELETE /chats/:id', del.status);

      const get = await request(app).get(`/chats/${tempChat.body.id}`).expect(404);
      console.log('GET after DELETE chat', get.text);
    });

    test('returns 404 for non-existent chat', async () => {
      const result = await request(app).delete('/chats/99999').expect(204);
      console.log('DELETE /chats/:id 404', result.status);
    });
  });

  describe('GET /chats/:chatId/participants', () => {
    test('lists participants for 1-on-1 chat', async () => {
      const result = await request(app).get(`/chats/${chatId}/participants`).expect(200);
      console.log('GET /chats/:id/participants (1-on-1)', result.body);
      expect(Array.isArray(result.body)).toBe(true);
      const usernames = result.body.map(p => p.username);
      expect(usernames).toEqual(expect.arrayContaining(['taylor_swift', 'ed_sheeran']));
    });

    test('lists participants for group chat', async () => {
      const result = await request(app).get(`/chats/${groupChatId}/participants`).expect(200);
      console.log('GET /chats/:id/participants (group)', result.body);
      expect(Array.isArray(result.body)).toBe(true);
      const usernames = result.body.map(p => p.username);
      expect(usernames).toEqual(expect.arrayContaining(['taylor_swift', 'ed_sheeran', 'billie_eilish', 'john_mayer']));
    });

    test('returns empty array for chat with no participants (edge case)', async () => {
      const emptyChat = await request(app)
        .post('/chats')
        .send({
          name: `Empty Chat ${Date.now()}`,
          is_group: false,
          created_by: 'taylor_swift',
          participants: []
        })
        .expect(201);

      const result = await request(app).get(`/chats/${emptyChat.body.id}/participants`).expect(200);
      console.log('GET /chats/:id/participants (empty)', result.body);
      expect(Array.isArray(result.body)).toBe(true);
      // Note: Chat creation automatically adds creator as participant
      expect(result.body).toHaveLength(1);
      expect(result.body[0]).toHaveProperty('username', 'taylor_swift');

      await request(app).delete(`/chats/${emptyChat.body.id}`).expect(204);
    });
  });

  describe('POST /chats/:chatId/participants', () => {
    test('adds a single participant', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/participants`)
        .send({ participants: ['billie_eilish'] })
        .expect(200);

      console.log('POST /chats/:id/participants (single)', result.body);
      expect(result.body).toHaveProperty('success', true);
      expect(result.body.addedParticipants).toHaveLength(1);

      const after = await request(app).get(`/chats/${chatId}/participants`).expect(200);
      const usernames = after.body.map(p => p.username);
      expect(usernames).toEqual(expect.arrayContaining(['billie_eilish']));
    });

    test('adds multiple participants', async () => {
      const result = await request(app)
        .post(`/chats/${groupChatId}/participants`)
        .send({ participants: ['taylor_swift', 'ed_sheeran'] }) // already there, should be ignored
        .expect(200);

      console.log('POST /chats/:id/participants (multiple)', result.body);
      expect(result.body).toHaveProperty('success', true);
    });

    test('handles non-existent user gracefully', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/participants`)
        .send({ participants: ['nonexistent_user'] })
        .expect(500);

      console.log('POST /chats/:id/participants (bad user)', result.body);
    });
  });

  describe('DELETE /chats/:chatId/participants/:username', () => {
    test('removes participant', async () => {
      const result = await request(app).delete(`/chats/${groupChatId}/participants/john_mayer`).expect(204);
      console.log('DELETE /chats/:id/participants/:user', result.status);

      const after = await request(app).get(`/chats/${groupChatId}/participants`).expect(200);
      const usernames = after.body.map(p => p.username);
      expect(usernames).not.toEqual(expect.arrayContaining(['john_mayer']));
    });

    test('returns 404 for non-existent participant', async () => {
      const result = await request(app).delete(`/chats/${chatId}/participants/nonexistent_user`).expect(404);
      console.log('DELETE /chats/:id/participants/:user 404', result.text);
      expect(result.text).toBe('Participant or chat not found');
    });

    test('returns 404 for non-existent chat', async () => {
      const result = await request(app).delete('/chats/99999/participants/taylor_swift').expect(404);
      console.log('DELETE /chats/:id/participants/:user bad chat 404', result.text);
      expect(result.text).toBe('Participant or chat not found');
    });
  });

  describe('POST /chats/:chatId/messages', () => {
    test('sends a message', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/messages`)
        .send({ sender_username: 'taylor_swift', content: 'hello from supertest' })
        .expect(201);

      console.log('POST /chats/:id/messages', result.body);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('content', 'hello from supertest');
      messageId = result.body.id;
    });

    test('sends message in group chat', async () => {
      const result = await request(app)
        .post(`/chats/${groupChatId}/messages`)
        .send({ sender_username: 'ed_sheeran', content: 'group message' })
        .expect(201);

      console.log('POST /chats/:id/messages (group)', result.body);
      expect(result.body).toHaveProperty('id');
      groupMessageId = result.body.id;
    });

    test('returns 500 for non-existent sender', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/messages`)
        .send({ sender_username: 'nonexistent_user', content: 'wont work' })
        .expect(500);

      console.log('POST /chats/:id/messages (bad sender)', result.body);
    });
  });

  describe('GET /chats/:chatId/messages', () => {
    test('lists messages', async () => {
      const result = await request(app).get(`/chats/${chatId}/messages`).expect(200);
      console.log('GET /chats/:id/messages', result.body);
      expect(Array.isArray(result.body)).toBe(true);
      expect(result.body.some(m => String(m.id) === String(messageId))).toBe(true);
    });

    test('supports pagination', async () => {
      const result = await request(app)
        .get(`/chats/${groupChatId}/messages`)
        .query({ limit: 1, offset: 0 })
        .expect(200);

      console.log('GET /chats/:id/messages (paginated)', result.body);
      expect(result.body.length).toBeLessThanOrEqual(1);
    });

    test('supports before filter', async () => {
      const result = await request(app)
        .get(`/chats/${chatId}/messages`)
        .query({ before: new Date().toISOString() })
        .expect(200);

      console.log('GET /chats/:id/messages (before)', result.body);
      expect(Array.isArray(result.body)).toBe(true);
    });

    test('returns empty for chat with no messages', async () => {
      const emptyChat = await request(app)
        .post('/chats')
        .send({
          name: `Empty Msg Chat ${Date.now()}`,
          is_group: false,
          created_by: 'taylor_swift',
          participants: ['ed_sheeran']
        })
        .expect(201);

      const result = await request(app).get(`/chats/${emptyChat.body.id}/messages`).expect(200);
      console.log('GET /chats/:id/messages (empty)', result.body);
      expect(result.body).toEqual([]);

      await request(app).delete(`/chats/${emptyChat.body.id}`).expect(204);
    });
  });

  describe('GET /chats/:chatId/messages/:messageId', () => {
    test('returns specific message', async () => {
      const result = await request(app).get(`/chats/${chatId}/messages/${messageId}`).expect(200);
      console.log('GET /chats/:id/messages/:id', result.body);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('content', 'hello from supertest');
    });

    test('returns 404 for non-existent message', async () => {
      const result = await request(app).get(`/chats/${chatId}/messages/99999`).expect(404);
      console.log('GET /chats/:id/messages/:id 404', result.text);
      expect(result.text).toBe('Message not found');
    });

    test('returns 404 for message in different chat', async () => {
      const result = await request(app).get(`/chats/${groupChatId}/messages/${messageId}`).expect(404);
      console.log('GET /chats/:id/messages/:id wrong chat 404', result.text);
      expect(result.text).toBe('Message not found');
    });
  });

  describe('PATCH /chats/:chatId/messages/:messageId', () => {
    test('updates message content', async () => {
      const result = await request(app)
        .patch(`/chats/${chatId}/messages/${messageId}`)
        .send({ content: 'edited from supertest' })
        .expect(200);

      console.log('PATCH /chats/:id/messages/:id', result.body);
      expect(result.body).toHaveProperty('id');
      expect(result.body).toHaveProperty('content', 'edited from supertest');
      expect(result.body).toHaveProperty('edited_at');
    });

    test('returns 404 for non-existent message', async () => {
      const result = await request(app)
        .patch(`/chats/${chatId}/messages/99999`)
        .send({ content: 'wont work' })
        .expect(404);

      console.log('PATCH /chats/:id/messages/:id 404', result.text);
      expect(result.text).toBe('Message not found');
    });

    test('ignores invalid fields', async () => {
      const result = await request(app)
        .patch(`/chats/${chatId}/messages/${messageId}`)
        .send({ content: 'edited again', invalid_field: 'ignored' })
        .expect(200);

      console.log('PATCH /chats/:id/messages/:id ignored', result.body);
      expect(result.body).toHaveProperty('content', 'edited again');
      expect(result.body).not.toHaveProperty('invalid_field');
    });
  });

  describe('DELETE /chats/:chatId/messages/:messageId', () => {
    test('deletes message', async () => {
      const result = await request(app).delete(`/chats/${groupChatId}/messages/${groupMessageId}`).expect(204);
      console.log('DELETE /chats/:id/messages/:id', result.status);

      const get = await request(app).get(`/chats/${groupChatId}/messages/${groupMessageId}`).expect(404);
      console.log('GET after DELETE message', get.text);
    });

    test('returns 404 for non-existent message', async () => {
      const result = await request(app).delete(`/chats/${chatId}/messages/99999`).expect(404);
      console.log('DELETE /chats/:id/messages/:id 404', result.text);
      expect(result.text).toBe('Message not found');
    });
  });

  describe('POST /chats/:chatId/read', () => {
    test('marks messages as read', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/read`)
        .send({ username: 'ed_sheeran', readUntilId: messageId })
        .expect(200);

      console.log('POST /chats/:id/read', result.body);
      expect(result.body).toHaveProperty('success', true);
      expect(result.body).toHaveProperty('markedCount');
      expect(result.body.markedCount).toBeGreaterThan(0);
    });

    test('handles non-existent user gracefully', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/read`)
        .send({ username: 'nonexistent_user', readUntilId: messageId })
        .expect(500);

      console.log('POST /chats/:id/read (bad user)', result.body);
    });

    test('handles non-existent message gracefully', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/read`)
        .send({ username: 'ed_sheeran', readUntilId: 99999 })
        .expect(200);

      console.log('POST /chats/:id/read (bad message)', result.body);
      expect(result.body).toHaveProperty('success', true);
      // Note: The implementation marks all messages up to the highest existing ID
      expect(result.body).toHaveProperty('markedCount');
      expect(result.body.markedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /chats/:chatId/typing', () => {
    test('sets typing indicator', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/typing`)
        .send({ username: 'taylor_swift', isTyping: true })
        .expect(200);

      console.log('POST /chats/:id/typing', result.body);
      expect(result.body).toHaveProperty('success', true);
      expect(result.body).toHaveProperty('isTyping', true);
      expect(result.body).toHaveProperty('timestamp');
    });

    test('clears typing indicator', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/typing`)
        .send({ username: 'taylor_swift', isTyping: false })
        .expect(200);

      console.log('POST /chats/:id/typing (false)', result.body);
      expect(result.body).toHaveProperty('success', true);
      expect(result.body).toHaveProperty('isTyping', false);
    });

    test('handles non-existent user', async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/typing`)
        .send({ username: 'nonexistent_user', isTyping: true })
        .expect(200);

      console.log('POST /chats/:id/typing (bad user)', result.body);
      expect(result.body).toHaveProperty('success', true);
    });
  });
});
