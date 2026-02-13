import request from 'supertest';
import { createApp } from '../app.js';
import { dbModels } from '../models/index.js';

describe('Users API routes', () => {
  const app = createApp({ db: dbModels });

  test('Check that app is running', async () => {
    const result = await request(app).get('/').expect(200);
    console.log('App Check', result.text);
    expect(result.text).toBe('Hello World!');
  });

  test('GET /users returns an array', async () => {
    const result = await request(app).get('/users').expect(200);
    console.log('GET /users', result.body);
    expect(Array.isArray(result.body)).toBe(true);
  });

  test('GET /users/:username returns a user (using existing seed data)', async () => {
    const result = await request(app).get('/users/taylor_swift').expect(200);
    console.log('GET /users/taylor_swift', result.body);
    expect(result.body).toHaveProperty('username', 'taylor_swift');
    expect(result.body).toHaveProperty('email');
  });

  test('GET /users/:username returns 404 for missing user', async () => {
    const result = await request(app).get('/users/does_not_exist_123456').expect(404);
    console.log('GET /users/:username 404', result.text);
    expect(result.text).toBe('User not found');
  });

  test('PUT /users/:username updates user fields (using existing seed data)', async () => {
    const result = await request(app)
      .put('/users/ed_sheeran')
      .send({ name: 'Ed Sheeran (Updated)' })
      .expect(200);

    console.log('PUT /users/ed_sheeran', result.body);
    expect(result.body).toHaveProperty('username', 'ed_sheeran');
    expect(result.body).toHaveProperty('name', 'Ed Sheeran (Updated)');

    const check = await request(app).get('/users/ed_sheeran').expect(200);
    expect(check.body).toHaveProperty('name', 'Ed Sheeran (Updated)');
  });

  test('DELETE /users/:username deletes the user (using existing seed data)', async () => {
    // First, create a temporary user to delete safely
    const tempUser = {
      username: `temp_user_${Date.now()}`,
      email: `temp_${Date.now()}@example.com`,
      password_hash: 'x'
    };

    await dbModels.User.createUser(tempUser.email, tempUser.password_hash, tempUser.username);

    const del = await request(app).delete(`/users/${tempUser.username}`).expect(204);
    console.log('DELETE /users/:username', del.status);

    const get = await request(app).get(`/users/${tempUser.username}`).expect(404);
    console.log('GET after DELETE', get.text);
  });
});
