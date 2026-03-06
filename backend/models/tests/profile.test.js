// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import pool from "../../db/index.js";
import { ProfileModel } from "../Profile.js";

const timestamp = Date.now();
const aliceUsername = `alice_${timestamp}`;
const bobUsername = `bob_${timestamp}`;
const testUsername = `testuser_${timestamp}`;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ProfileModel.listUsers", () => {
  test("returns all users", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { username: aliceUsername },
        { username: bobUsername },
        { username: testUsername },
      ],
    });

    const result = await ProfileModel.listUsers();
    expect(result.length).toBe(3);
  });
});

describe("ProfileModel.getUserByUsername", () => {
  test("returns a single user by username", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ username: testUsername }],
    });

    const result = await ProfileModel.getUserByUsername(testUsername);
    expect(result).toHaveProperty("username", testUsername);
  });
});

describe("ProfileModel.createUser", () => {
  test("creates a new user successfully", async () => {
    const newUser = {
      username: `newuser_${timestamp}`,
      name: "New User",
      role: "Drummer",
      age: 22,
      gender: "Male",
      genre: "Rock",
      experience: 2,
      main_image: "new.jpg",
      concert_image: "new_concert.jpg",
      last_song: "New Song",
      last_song_desc: "New Desc",
    };

    pool.query.mockResolvedValueOnce({
      rows: [{ username: newUser.username }],
    });

    const result = await ProfileModel.createUser(newUser);
    expect(result).toHaveProperty("username", newUser.username);
  });

  test("throws and propagates DB errors", async () => {
    const newUser = {
      username: `newuser_err_${timestamp}`,
      name: "New User",
      role: "Drummer",
      age: 22,
      gender: "Male",
      genre: "Rock",
      experience: 2,
      main_image: "new.jpg",
      concert_image: "new_concert.jpg",
      last_song: "New Song",
      last_song_desc: "New Desc",
    };

    pool.query.mockRejectedValueOnce(new Error("Insert failed"));

    await expect(ProfileModel.createUser(newUser)).rejects.toThrow(
      "Insert failed",
    );
  });
});

describe("ProfileModel.updateUser", () => {
  test("throws error when updateData is omitted", async () => {
    await expect(ProfileModel.updateUser(testUsername)).rejects.toThrow(
      "No fields to update",
    );
  });

  test("throws error when updateData is empty", async () => {
    await expect(ProfileModel.updateUser(testUsername, {})).rejects.toThrow(
      "No fields to update",
    );
  });

  test("updates user fields successfully", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ username: testUsername }],
    });

    const result = await ProfileModel.updateUser(testUsername, { age: 35 });
    expect(result).toHaveProperty("username", testUsername);
  });

  test("maps profilePhotoUrl to main_image when main_image is not provided", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ username: testUsername, main_image: "profile.jpg" }],
    });

    await ProfileModel.updateUser(testUsername, {
      profilePhotoUrl: "profile.jpg",
    });

    const calledQuery = pool.query.mock.calls[0][0];
    const calledValues = pool.query.mock.calls[0][1];
    expect(calledQuery).toContain("main_image = $2");
    expect(calledValues).toEqual([testUsername, "profile.jpg"]);
  });

  test("maps coverPhotoUrl to concert_image when concert_image is not provided", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ username: testUsername, concert_image: "cover.jpg" }],
    });

    await ProfileModel.updateUser(testUsername, {
      coverPhotoUrl: "cover.jpg",
    });

    const calledQuery = pool.query.mock.calls[0][0];
    const calledValues = pool.query.mock.calls[0][1];
    expect(calledQuery).toContain("concert_image = $2");
    expect(calledValues).toEqual([testUsername, "cover.jpg"]);
  });

  test("returns null when username does not match any row", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // rows[0] is undefined → ?? null

    const result = await ProfileModel.updateUser("ghost_user", { age: 30 });

    expect(result).toBeNull();
  });

  test("throws and propagates DB errors", async () => {
    pool.query.mockRejectedValueOnce(new Error("Update failed"));
    await expect(ProfileModel.updateUser(testUsername, { age: 30 })).rejects.toThrow(
      "Update failed",
    );
  });
});

describe("ProfileModel.deleteUser", () => {
  test("returns the deleted user row on success", async () => {
    const deletedRow = { id: 1, username: testUsername };
    pool.query.mockResolvedValueOnce({ rows: [deletedRow] });

    const result = await ProfileModel.deleteUser(testUsername);
    expect(result).toEqual(deletedRow);
  });

  test("returns null when username does not match any row", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // rows[0] is undefined → ?? null

    const result = await ProfileModel.deleteUser("ghost_user");

    expect(result).toBeNull();
  });

  test("passes the username as the only query parameter", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ username: testUsername }] });

    await ProfileModel.deleteUser(testUsername);
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), [testUsername]);
  });

  test("throws and propagates on DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("Delete failed"));
    await expect(ProfileModel.deleteUser(testUsername)).rejects.toThrow("Delete failed");
  });
});

describe("ProfileModel.updateCoverPhoto", () => {
  test("updates concert_image with the provided URL", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ username: testUsername, concert_image: "cover.jpg" }] });

    const result = await ProfileModel.updateCoverPhoto(testUsername, { url: "cover.jpg" });

    const calledQuery = pool.query.mock.calls[0][0];
    expect(calledQuery).toContain("concert_image");
    expect(result).toHaveProperty("concert_image", "cover.jpg");
  });

  test("sets concert_image to empty string when coverPhotoData has no url", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ username: testUsername, concert_image: "" }] });

    await ProfileModel.updateCoverPhoto(testUsername, {});

    const calledValues = pool.query.mock.calls[0][1];
    expect(calledValues).toContain("");
  });

  test("sets concert_image to empty string when coverPhotoData is null", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ username: testUsername, concert_image: "" }] });

    await ProfileModel.updateCoverPhoto(testUsername, null);

    const calledValues = pool.query.mock.calls[0][1];
    expect(calledValues).toContain("");
  });
});

describe("ProfileModel.getNotificationPreferences", () => {
  test("returns preferences object containing the username", async () => {
    const result = await ProfileModel.getNotificationPreferences(testUsername);
    expect(result).toHaveProperty("username", testUsername);
  });

  test("returns all expected preference keys with correct default values", async () => {
    const result = await ProfileModel.getNotificationPreferences(testUsername);
    expect(result).toMatchObject({
      emailNotifications:   true,
      pushNotifications:    true,
      matchNotifications:   true,
      messageNotifications: true,
      eventNotifications:   true,
      likeNotifications:    false,
    });
  });
});

describe("ProfileModel.updateNotificationPreferences", () => {
  test("returns merged preferences with the username", async () => {
    const prefs = { emailNotifications: false, likeNotifications: true };
    const result = await ProfileModel.updateNotificationPreferences(testUsername, prefs);

    expect(result).toMatchObject({ username: testUsername, ...prefs });
  });

  test("spreads all provided preference keys into the returned object", async () => {
    const prefs = { pushNotifications: false, matchNotifications: false };
    const result = await ProfileModel.updateNotificationPreferences(testUsername, prefs);

    expect(result.pushNotifications).toBe(false);
    expect(result.matchNotifications).toBe(false);
  });
});
