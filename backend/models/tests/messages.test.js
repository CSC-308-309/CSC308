// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import pool from "../../db/index.js";
import { MessagesModel } from "../Messages.js";

describe("MessagesModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listChats", () => {
    test("returns list of chats for user", async () => {
      const mockChats = [
        {
          id: 1,
          is_group: false,
          name: "Chat 1",
          created_by: 1,
          created_at: new Date(),
        },
      ];
      pool.query.mockResolvedValue({ rows: mockChats });

      const result = await MessagesModel.listChats({
        username: "testuser",
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockChats);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ["testuser", 10, 0]
      );
    });

    test("handles default parameters", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await MessagesModel.listChats({ username: "testuser" });

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ["testuser", 50, 0]
      );
    });
  });

  describe("createChat", () => {
    test("creates chat with participants successfully", async () => {
      const mockChat = {
        id: 1,
        is_group: false,
        name: "Test Chat",
        created_by: 1,
        created_at: new Date(),
      };
      
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockChat] }) // Create chat
        .mockResolvedValueOnce({ rows: [{ user_id: 2 }] }) // Add participant 1
        .mockResolvedValueOnce({ rows: [{ user_id: 3 }] }) // Add participant 2
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const result = await MessagesModel.createChat({
        name: "Test Chat",
        created_by: "testuser",
        participants: ["user1", "user2"],
      });

      expect(result).toEqual(mockChat);
      expect(pool.query).toHaveBeenCalledTimes(5); // BEGIN, INSERT chat, 2x INSERT participants, COMMIT
    });

    test("handles transaction rollback on error", async () => {
      const error = new Error("Database error");
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(error); // INSERT chat fails

      await expect(MessagesModel.createChat({
        name: "Test Chat",
        created_by: "testuser",
        participants: ["user1"],
      })).rejects.toThrow(error);

      expect(pool.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("getChat", () => {
    test("returns chat when found", async () => {
      const mockChat = {
        id: 1,
        is_group: false,
        name: "Test Chat",
        created_by: 1,
        created_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockChat] });

      const result = await MessagesModel.getChat(1);

      expect(result).toEqual(mockChat);
    });

    test("returns null when chat not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MessagesModel.getChat(999);

      expect(result).toBeNull();
    });
  });

  describe("updateChat", () => {
    test("updates chat successfully", async () => {
      const mockUpdatedChat = {
        id: 1,
        is_group: false,
        name: "Updated Chat",
        created_by: 1,
        created_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockUpdatedChat] });

      const result = await MessagesModel.updateChat(1, {
        name: "Updated Chat",
      });

      expect(result).toEqual(mockUpdatedChat);
    });

    test("returns null when no valid fields", async () => {
      const result = await MessagesModel.updateChat(1, {
        invalidField: "value",
      });

      expect(result).toBeNull();
      expect(pool.query).not.toHaveBeenCalled();
    });

    test("filters out undefined values", async () => {
      const mockUpdatedChat = {
        id: 1,
        name: "Updated Chat",
        created_by: 1,
        created_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockUpdatedChat] });

      const result = await MessagesModel.updateChat(1, {
        name: "Updated Chat",
        is_group: undefined,
      });

      expect(result).toEqual(mockUpdatedChat);
    });
  });

  describe("deleteChat", () => {
    test("deletes chat successfully", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // DELETE messages
        .mockResolvedValueOnce({ rows: [] }) // DELETE chat_members
        .mockResolvedValueOnce({ rows: [] }); // DELETE chats

      const result = await MessagesModel.deleteChat(1);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith("COMMIT");
    });

    test("handles transaction rollback on error", async () => {
      const error = new Error("Database error");
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(error); // DELETE messages fails

      await expect(MessagesModel.deleteChat(1)).rejects.toThrow(error);

      expect(pool.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("listChatParticipants", () => {
    test("returns list of participants", async () => {
      const mockParticipants = [
        {
          username: "user1",
          name: "User One",
          avatar: "avatar1.jpg",
          joined_at: new Date(),
        },
      ];
      pool.query.mockResolvedValue({ rows: mockParticipants });

      const result = await MessagesModel.listChatParticipants(1);

      expect(result).toEqual(mockParticipants);
    });
  });

  describe("addChatParticipants", () => {
    test("adds participants successfully", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ user_id: 2 }] }) // Add participant 1
        .mockResolvedValueOnce({ rows: [{ user_id: 3 }] }); // Add participant 2

      const result = await MessagesModel.addChatParticipants(1, {
        participants: ["user1", "user2"],
      });

      expect(result).toEqual({
        success: true,
        addedParticipants: [{ user_id: 2 }, { user_id: 3 }],
      });
      expect(pool.query).toHaveBeenCalledWith("COMMIT");
    });

    test("handles transaction rollback on error", async () => {
      const error = new Error("Database error");
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(error); // INSERT participant fails

      await expect(MessagesModel.addChatParticipants(1, {
        participants: ["user1"],
      })).rejects.toThrow(error);

      expect(pool.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("removeChatParticipant", () => {
    test("removes participant successfully", async () => {
      pool.query.mockResolvedValue({ rows: [{ user_id: 2 }] });

      const result = await MessagesModel.removeChatParticipant(1, "user1");

      expect(result).toBe(true);
    });

    test("returns false when participant not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MessagesModel.removeChatParticipant(1, "nonexistent");

      expect(result).toBe(false);
    });
  });

  describe("listMessages", () => {
    test("returns messages with pagination", async () => {
      const mockMessages = [
        {
          id: 1,
          chat_id: 1,
          sent_by: 1,
          content: "Hello",
          created_at: new Date(),
        },
      ];
      pool.query.mockResolvedValue({ rows: mockMessages });

      const result = await MessagesModel.listMessages(1, {
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockMessages.reverse()); // Should be reversed for chronological order
    });

    test("handles before parameter", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      await MessagesModel.listMessages(1, {
        before: "2023-01-01T00:00:00Z",
        limit: 10,
        offset: 0,
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("AND m.created_at <"),
        expect.arrayContaining([1, "2023-01-01T00:00:00Z", 10, 0])
      );
    });
  });

  describe("getMessage", () => {
    test("returns message when found", async () => {
      const mockMessage = {
        id: 1,
        chat_id: 1,
        sent_by: 1,
        content: "Hello",
        created_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockMessage] });

      const result = await MessagesModel.getMessage(1, 1);

      expect(result).toEqual(mockMessage);
    });

    test("returns null when message not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MessagesModel.getMessage(1, 999);

      expect(result).toBeNull();
    });
  });

  describe("sendMessage", () => {
    test("sends message successfully", async () => {
      const mockMessage = {
        id: 1,
        chat_id: 1,
        sent_by: 1,
        content: "Hello",
        created_at: new Date(),
      };
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockMessage] }); // INSERT message

      const result = await MessagesModel.sendMessage(1, {
        sender_username: "testuser",
        content: "Hello",
      });

      expect(result).toEqual(mockMessage);
      expect(pool.query).toHaveBeenCalledWith("COMMIT");
    });

    test("handles transaction rollback on error", async () => {
      const error = new Error("Database error");
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockRejectedValueOnce(error); // INSERT message fails

      await expect(MessagesModel.sendMessage(1, {
        sender_username: "testuser",
        content: "Hello",
      })).rejects.toThrow(error);

      expect(pool.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("updateMessage", () => {
    test("updates message successfully", async () => {
      const mockUpdatedMessage = {
        id: 1,
        chat_id: 1,
        sent_by: 1,
        content: "Updated content",
        created_at: new Date(),
        edited_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockUpdatedMessage] });

      const result = await MessagesModel.updateMessage(1, 1, {
        content: "Updated content",
      });

      expect(result).toEqual(mockUpdatedMessage);
    });

    test("returns null when message not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MessagesModel.updateMessage(1, 999, {
        content: "Updated content",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteMessage", () => {
    test("deletes message successfully", async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await MessagesModel.deleteMessage(1, 1);

      expect(result).toBe(true);
    });

    test("returns false when message not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MessagesModel.deleteMessage(1, 999);

      expect(result).toBe(false);
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(MessagesModel.deleteMessage(1, 1))
        .rejects.toThrow(error);
    });
  });

  describe("markChatRead", () => {

    test("handles transaction rollback on error", async () => {
      const error = new Error("Database error");
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Get user ID
        .mockRejectedValueOnce(error); // Mark as read fails

      await expect(MessagesModel.markChatRead(1, {
        username: "testuser",
        readUntilId: 10,
      })).rejects.toThrow(error);

      expect(pool.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("setTyping", () => {
    test("returns typing status", async () => {
      const result = await MessagesModel.setTyping(1, {
        username: "testuser",
        isTyping: true,
      });

      expect(result).toEqual({
        success: true,
        chatId: 1,
        username: "testuser",
        isTyping: true,
        timestamp: expect.any(String),
      });
    });
  });
});
