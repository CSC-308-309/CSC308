import { NotificationsModel } from "../Notifications.js";

const originalNotifications = JSON.parse(
  JSON.stringify(NotificationsModel.mockNotifications),
);

beforeEach(() => {
  NotificationsModel.mockNotifications = JSON.parse(
    JSON.stringify(originalNotifications),
  );
});

describe("NotificationsModel.listNotifications", () => {
  test("returns only the target user's notifications sorted by newest first", async () => {
    NotificationsModel.mockNotifications.push({
      id: "100",
      username: "other-user",
      type: "message",
      message: "ignore me",
      link: "/x",
      is_read: false,
      is_archived: false,
      created_at: new Date("2025-01-21T00:00:00").toISOString(),
    });

    const result = await NotificationsModel.listNotifications("foxes");

    expect(result.every((n) => n.username === "foxes")).toBe(true);
    expect(result[0].created_at >= result[result.length - 1].created_at).toBe(
      true,
    );
  });
});

describe("NotificationsModel.getUnreadNotificationsCount", () => {
  test("counts only unread notifications for the given user", async () => {
    const result = await NotificationsModel.getUnreadNotificationsCount("foxes");
    expect(result).toBe(3);
  });
});

describe("NotificationsModel.getNotification", () => {
  test("returns a notification when id exists", async () => {
    const result = await NotificationsModel.getNotification("1");
    expect(result).toHaveProperty("id", "1");
  });

  test("returns null when id does not exist", async () => {
    const result = await NotificationsModel.getNotification("nope");
    expect(result).toBeNull();
  });
});

describe("NotificationsModel.createNotification", () => {
  test("creates a notification with defaults", async () => {
    const result = await NotificationsModel.createNotification({
      username: "foxes",
    });

    expect(result.id).toMatch(/^notif-/);
    expect(result).toMatchObject({
      username: "foxes",
      type: null,
      message: null,
      link: null,
      is_read: false,
      is_archived: false,
    });
  });

  test("throws when username is missing", async () => {
    await expect(NotificationsModel.createNotification({})).rejects.toThrow(
      "username is required to create a notification",
    );
  });
});

describe("NotificationsModel.markNotificationRead", () => {
  test("marks notification as read when found", async () => {
    const result = await NotificationsModel.markNotificationRead("1");
    expect(result).toHaveProperty("is_read", true);
  });

  test("returns null when notification is not found", async () => {
    const result = await NotificationsModel.markNotificationRead("missing");
    expect(result).toBeNull();
  });
});

describe("NotificationsModel.markNotificationUnread", () => {
  test("marks notification as unread when found", async () => {
    const result = await NotificationsModel.markNotificationUnread("3");
    expect(result).toHaveProperty("is_read", false);
  });

  test("returns null when notification is not found", async () => {
    const result = await NotificationsModel.markNotificationUnread("missing");
    expect(result).toBeNull();
  });
});

describe("NotificationsModel.markAllNotificationsRead", () => {
  test("marks all unread notifications as read using body.username", async () => {
    const result = await NotificationsModel.markAllNotificationsRead({
      username: "foxes",
    });
    expect(result).toEqual({ success: true });

    const unreadCount = await NotificationsModel.getUnreadNotificationsCount(
      "foxes",
    );
    expect(unreadCount).toBe(0);
  });

  test("supports body.user.username fallback", async () => {
    const result = await NotificationsModel.markAllNotificationsRead({
      user: { username: "foxes" },
    });
    expect(result).toEqual({ success: true });
  });

  test("throws when username is missing", async () => {
    await expect(
      NotificationsModel.markAllNotificationsRead({ user: {} }),
    ).rejects.toThrow("username is required");
  });
});

describe("NotificationsModel.archiveNotification", () => {
  test("archives notification when found", async () => {
    const result = await NotificationsModel.archiveNotification("1");
    expect(result).toHaveProperty("is_archived", true);
  });

  test("returns null when notification is not found", async () => {
    const result = await NotificationsModel.archiveNotification("missing");
    expect(result).toBeNull();
  });
});

describe("NotificationsModel.unarchiveNotification", () => {
  test("unarchives notification when found", async () => {
    await NotificationsModel.archiveNotification("1");
    const result = await NotificationsModel.unarchiveNotification("1");
    expect(result).toHaveProperty("is_archived", false);
  });

  test("returns null when notification is not found", async () => {
    const result = await NotificationsModel.unarchiveNotification("missing");
    expect(result).toBeNull();
  });
});

describe("NotificationsModel.deleteNotification", () => {
  test("deletes notification when found", async () => {
    const deleted = await NotificationsModel.deleteNotification("1");
    expect(deleted).toBe(true);

    const shouldBeNull = await NotificationsModel.getNotification("1");
    expect(shouldBeNull).toBeNull();
  });

  test("returns false when notification is not found", async () => {
    const result = await NotificationsModel.deleteNotification("missing");
    expect(result).toBe(false);
  });
});
