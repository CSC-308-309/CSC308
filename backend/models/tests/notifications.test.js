// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import pool from "../../db/index.js";
import { NotificationsModel } from "../Notifications.js";

describe("NotificationsModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listNotifications", () => {
    test("returns notifications for user with display formatting", async () => {
      const mockRows = [
        {
          id: 1,
          type: "like",
          reference_id: null,
          is_read: false,
          created_at: new Date("2025-01-21T00:00:00"),
          actor_username: "testuser",
        },
        {
          id: 2,
          type: "message",
          reference_id: 123,
          is_read: true,
          created_at: new Date("2025-01-20T00:00:00"),
          actor_username: "sender",
        },
        {
          id: 3,
          type: "match",
          reference_id: null,
          is_read: false,
          created_at: new Date("2025-01-19T00:00:00"),
          actor_username: null,
        },
      ];

      pool.query.mockResolvedValue({ rows: mockRows });

      const result = await NotificationsModel.listNotifications("foxes");

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 1,
        type: "like",
        username: "testuser",
        message: "liked your profile.",
        link: "/profile/testuser",
        is_read: false,
        created_at: mockRows[0].created_at,
        reference_id: null,
      });
      expect(result[1]).toEqual({
        id: 2,
        type: "message",
        username: "sender",
        message: "sent you a message.",
        link: "/messages?chatId=123",
        is_read: true,
        created_at: mockRows[1].created_at,
        reference_id: 123,
      });
      expect(result[2]).toEqual({
        id: 3,
        type: "match",
        username: "System",
        message: "matched with you.",
        link: "/profile",
        is_read: false,
        created_at: mockRows[2].created_at,
        reference_id: null,
      });
    });

    test("returns empty array when user has no notifications", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await NotificationsModel.listNotifications("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("getUnreadNotificationsCount", () => {
    test("returns count of unread notifications", async () => {
      pool.query.mockResolvedValue({ rows: [{ count: 3 }] });

      const result = await NotificationsModel.getUnreadNotificationsCount("foxes");

      expect(result).toBe(3);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("COUNT(*)::int AS count"),
        ["foxes"]
      );
    });

    test("returns 0 when no unread notifications", async () => {
      pool.query.mockResolvedValue({ rows: [{ count: 0 }] });

      const result = await NotificationsModel.getUnreadNotificationsCount("foxes");

      expect(result).toBe(0);
    });
  });

  describe("getNotification", () => {
    test("returns notification with display formatting", async () => {
      const mockRow = {
        id: 1,
        type: "like",
        reference_id: null,
        is_read: false,
        created_at: new Date(),
        actor_username: "testuser",
      };

      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await NotificationsModel.getNotification("1");

      expect(result).toEqual({
        id: 1,
        type: "like",
        username: "testuser",
        message: "liked your profile.",
        link: "/profile/testuser",
        is_read: false,
        created_at: mockRow.created_at,
        reference_id: null,
      });
    });

    test("returns null when notification not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await NotificationsModel.getNotification("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("createNotification", () => {
    test("creates notification successfully", async () => {
      const mockRow = {
        id: 123,
        type: "like",
        reference_id: null,
        is_read: false,
        created_at: new Date(),
      };

      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await NotificationsModel.createNotification({
        username: "recipient",
        actorUsername: "sender",
        type: "like",
        referenceId: null,
      });

      expect(result).toEqual({
        id: 123,
        type: "like",
        reference_id: null,
        is_read: false,
        created_at: mockRow.created_at,
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO notifications"),
        ["recipient", "sender", "like", null]
      );
    });

    test("throws error when username is missing", async () => {
      await expect(NotificationsModel.createNotification({}))
        .rejects.toThrow("username (recipient) is required");
    });

    test("throws error when type is missing", async () => {
      await expect(NotificationsModel.createNotification({ username: "test" }))
        .rejects.toThrow("type is required");
    });
  });

  describe("markNotificationRead", () => {
    test("marks notification as read", async () => {
      const mockRow = {
        id: 1,
        is_read: true,
      };

      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await NotificationsModel.markNotificationRead("1");

      expect(result).toEqual({
        id: 1,
        is_read: true,
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SET is_read = true, read_at = now()"),
        ["1"]
      );
    });

    test("returns null when notification not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await NotificationsModel.markNotificationRead("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("markNotificationUnread", () => {
    test("marks notification as unread", async () => {
      const mockRow = {
        id: 1,
        is_read: false,
      };

      pool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await NotificationsModel.markNotificationUnread("1");

      expect(result).toEqual({
        id: 1,
        is_read: false,
      });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SET is_read = false, read_at = NULL"),
        ["1"]
      );
    });

    test("returns null when notification not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await NotificationsModel.markNotificationUnread("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("markAllNotificationsRead", () => {
    test("marks all notifications as read", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await NotificationsModel.markAllNotificationsRead({
        username: "foxes",
      });

      expect(result).toEqual({ success: true });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("SET is_read = true, read_at = now()"),
        ["foxes"]
      );
    });

    test("supports body.user.username fallback", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await NotificationsModel.markAllNotificationsRead({
        user: { username: "foxes" },
      });

      expect(result).toEqual({ success: true });
    });

    test("throws error when username is missing", async () => {
      await expect(
        NotificationsModel.markAllNotificationsRead({ user: {} })
      ).rejects.toThrow("username is required");
    });
  });

  describe("deleteNotification", () => {
    test("deletes notification successfully", async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });

      const result = await NotificationsModel.deleteNotification("1");

      expect(result).toBe(true);

      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM notifications WHERE id = $1 RETURNING id",
        ["1"]
      );
    });

    test("returns false when notification not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await NotificationsModel.deleteNotification("nonexistent");

      expect(result).toBe(false);
    });
  });
});
