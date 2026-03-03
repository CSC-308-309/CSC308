// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import pool from "../../db/index.js";
import { ProfileModel } from "../Profile.js";
import { InteractionsModel } from "../Interactions.js";

const timestamp = Date.now();
const aliceUsername = `alice_${timestamp}`;
const bobUsername = `bob_${timestamp}`;
const testUsername = `testuser_${timestamp}`;

beforeEach(() => {
  jest.clearAllMocks();
});

//
// ───────────────────── ProfileModel Tests ─────────────────────
//

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
});

describe("ProfileModel.updateUser", () => {
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
    expect(result).toBe(testUsername);
  });
});

//
// ─────────────────── InteractionsModel Tests ───────────────────
//

describe("InteractionsModel", () => {
  test("likeUser works correctly", async () => {
    pool.query.mockResolvedValueOnce({});

    const result = await InteractionsModel.likeUser(aliceUsername, bobUsername);

    expect(result).toEqual({
      message: `User ${aliceUsername} liked user ${bobUsername}`,
    });
  });

  test("dislikeUser works correctly", async () => {
    pool.query.mockResolvedValueOnce({});

    const result = await InteractionsModel.dislikeUser(
      aliceUsername,
      bobUsername,
    );

    expect(result).toEqual({
      message: `User ${aliceUsername} disliked user ${bobUsername}`,
    });
  });

  test("blockUser works correctly", async () => {
    pool.query.mockResolvedValueOnce({});

    const result = await InteractionsModel.blockUser(
      aliceUsername,
      bobUsername,
    );

    expect(result).toEqual({
      message: `User ${aliceUsername} blocked user ${bobUsername}`,
    });
  });
});
