jest.mock("uuid", () => ({
  v4: () => "test-uuid"
}));
import request from "supertest";
import { createApp } from "../../app.js";
import { dbModels } from "../index.js";
import pool from "../../db/index.js";

describe("Chats/Messages API routes", () => {
  const app = createApp({ db: dbModels });

  let chatId;
  let messageId;
  let groupChatId;
  let groupMessageId;

  beforeAll(async () => {
    // Insert required users
    const users = [
      { username: "taylor_swift", email: "ts@test.com" },
      { username: "ed_sheeran", email: "ed@test.com" },
      { username: "billie_eilish", email: "billie@test.com" },
      { username: "john_mayer", email: "john@test.com" },
    ];

    for (const u of users) {
      await pool.query(
        `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, 'test_hash')
        ON CONFLICT (username) DO NOTHING
      `,
        [u.username, u.email]
      );
    }

    // Create personal chat
    const result = await request(app)
      .post("/chats")
      .send({
        name: `Test Chat ${Date.now()}`,
        is_group: false,
        created_by: "taylor_swift",
        participants: ["ed_sheeran", "taylor_swift"],
      })
      .expect(201);

    chatId = result.body.id;

    // Create group chat
    const groupResult = await request(app)
      .post("/chats")
      .send({
        name: `Test Group Chat ${Date.now()}`,
        is_group: true,
        created_by: "taylor_swift",
        participants: ["ed_sheeran", "billie_eilish", "john_mayer"],
      })
      .expect(201);

    groupChatId = groupResult.body.id;
  });

  afterAll(async () => {

  const chats = [chatId, groupChatId];

  // 1️⃣ messages_read
  await pool.query(`
    DELETE FROM messages_read
    WHERE message_id IN (
      SELECT id FROM messages WHERE chat_id = ANY($1)
    )
  `, [chats]);

  // 2️⃣ messages
  await pool.query(`
    DELETE FROM messages
    WHERE chat_id = ANY($1)
  `, [chats]);

  // 3️⃣ chat_members (ALL members of those chats)
  await pool.query(`
    DELETE FROM chat_members
    WHERE chat_id = ANY($1)
  `, [chats]);

  // 4️⃣ chats
  await pool.query(`
    DELETE FROM chats
    WHERE id = ANY($1)
  `, [chats]);

  await pool.end();
});

  describe("POST /chats", () => {
    test("creates a chat", async () => {
      const result = await request(app)
        .post("/chats")
        .send({
          name: `API Chat ${Date.now()}`,
          is_group: false,
          created_by: "taylor_swift",
          participants: ["ed_sheeran", "taylor_swift"],
        })
        .expect(201);

      expect(result.body).toHaveProperty("id");
      expect(result.body).toHaveProperty("is_group", false);
    });

    test("creates a group chat", async () => {
      const result = await request(app)
        .post("/chats")
        .send({
          name: `API Group Chat ${Date.now()}`,
          is_group: true,
          created_by: "taylor_swift",
          participants: ["ed_sheeran", "billie_eilish"],
        })
        .expect(201);

      expect(result.body).toHaveProperty("id");
      expect(result.body).toHaveProperty("is_group", true);
    });
  });

  describe("GET /chats", () => {
    test("lists chats for user", async () => {
      const result = await request(app)
        .get("/chats")
        .query({ username: "taylor_swift" })
        .expect(200);

      expect(Array.isArray(result.body)).toBe(true);
      expect(result.body.length).toBeGreaterThan(0);
    });

    test("lists chats for ed_sheeran", async () => {
      const result = await request(app)
        .get("/chats")
        .query({ username: "ed_sheeran" })
        .expect(200);

      expect(Array.isArray(result.body)).toBe(true);
      expect(result.body.length).toBeGreaterThan(0);
    });

    test("handles pagination", async () => {
      const result = await request(app)
        .get("/chats")
        .query({ username: "taylor_swift", limit: 1, offset: 0 })
        .expect(200);

      expect(result.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe("GET /chats/:chatId", () => {
    test("returns chat details", async () => {
      const result = await request(app).get(`/chats/${chatId}`).expect(200);

      expect(result.body).toHaveProperty("id");
      expect(result.body).toHaveProperty("is_group");
    });

    test("returns 404 for non-existent chat", async () => {
      const result = await request(app).get("/chats/99999").expect(404);
      expect(result.text).toBe("Chat not found");
    });
  });

  describe("PATCH /chats/:chatId", () => {
    test("updates chat name", async () => {
      const result = await request(app)
        .patch(`/chats/${groupChatId}`)
        .send({ name: "Updated Group Chat Name" })
        .expect(200);

      expect(result.body).toHaveProperty("name", "Updated Group Chat Name");
    });
  });

  describe("GET /chats/:chatId/participants", () => {
    test("lists participants", async () => {
      const result = await request(app)
        .get(`/chats/${chatId}/participants`)
        .expect(200);

      const usernames = result.body.map((p) => p.username);
      expect(usernames).toEqual(
        expect.arrayContaining(["ed_sheeran"])
      );
    });
  });

  describe("POST /chats/:chatId/messages", () => {
    test("sends a message", async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/messages`)
        .send({
          sender_username: "taylor_swift",
          content: "hello from supertest",
        })
        .expect(201);

      expect(result.body).toHaveProperty("id");
      expect(result.body).toHaveProperty("content", "hello from supertest");

      messageId = result.body.id;
    });

    test("sends group message", async () => {
      const result = await request(app)
        .post(`/chats/${groupChatId}/messages`)
        .send({
          sender_username: "ed_sheeran",
          content: "group message",
        })
        .expect(201);

      expect(result.body).toHaveProperty("id");
      groupMessageId = result.body.id;
    });
  });

  describe("GET /chats/:chatId/messages", () => {
    test("lists messages", async () => {
      const result = await request(app)
        .get(`/chats/${chatId}/messages`)
        .expect(200);

      expect(Array.isArray(result.body)).toBe(true);
      expect(
        result.body.some((m) => String(m.id) === String(messageId))
      ).toBe(true);
    });
  });

  describe("GET /chats/:chatId/messages/:messageId", () => {
    test("returns specific message", async () => {
      const result = await request(app)
        .get(`/chats/${chatId}/messages/${messageId}`)
        .expect(200);

      expect(result.body).toHaveProperty("content", "hello from supertest");
    });

    test("returns 404 for non-existent message", async () => {
      const result = await request(app)
        .get(`/chats/${chatId}/messages/99999`)
        .expect(404);

      expect(result.text).toBe("Message not found");
    });
  });

  describe("PATCH /chats/:chatId/messages/:messageId", () => {
    test("updates message", async () => {
      const result = await request(app)
        .patch(`/chats/${chatId}/messages/${messageId}`)
        .send({ content: "edited from supertest" })
        .expect(200);

      expect(result.body).toHaveProperty("content", "edited from supertest");
      expect(result.body).toHaveProperty("edited_at");
    });
  });

  describe("DELETE /chats/:chatId/messages/:messageId", () => {
    test("deletes message", async () => {
      await request(app)
        .delete(`/chats/${groupChatId}/messages/${groupMessageId}`)
        .expect(204);

      const get = await request(app)
        .get(`/chats/${groupChatId}/messages/${groupMessageId}`)
        .expect(404);

      expect(get.text).toBe("Message not found");
    });
  });

  describe("POST /chats/:chatId/read", () => {
    test("marks messages as read", async () => {
      const result = await request(app)
        .post(`/chats/${chatId}/read`)
        .send({ username: "ed_sheeran", readUntilId: messageId })
        .expect(200);

      expect(result.body).toHaveProperty("success", true);
      expect(result.body).toHaveProperty("markedCount");
      expect(result.body.markedCount).toBeGreaterThanOrEqual(0);
    });
  });
});