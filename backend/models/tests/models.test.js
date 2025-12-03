import pool from "../../db/index.js";
import { ProfileModel } from "../Profile.js";
import { InteractionsModel } from "../Interactions.js";

// Mock the database pool
jest.mock("../../db/index.js", () => ({
  query: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// PROFILE MODEL TESTS

describe("ProfileModel.listUsers", () => {
  test("returns all user rows", async () => {
    const mockRows = [{ username: "alice" }, { username: "bob" }];
    pool.query.mockResolvedValue({ rows: mockRows });

    const result = await ProfileModel.listUsers();

    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual(mockRows);
  });
});

describe("ProfileModel.getUserByUsername", () => {
  test("returns a single user row", async () => {
    const mockRow = { username: "alice" };
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await ProfileModel.getUserByUsername("alice");

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ["alice"]);
    expect(result).toEqual(mockRow);
  });
});

describe("ProfileModel.createUser", () => {
  const profileData = {
    username: "john",
    name: "John",
    role: "Singer",
    age: 25,
    gender: "Male",
    genre: "Pop",
    experience: "3 years",
    main_image: "img.jpg",
    concert_image: "concert.jpg",
    last_song: "Song A",
    last_song_desc: "Desc",
  };

  test("successfully inserts user and returns result", async () => {
    const mockRow = { id: 1, username: "john" };
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await ProfileModel.createUser(profileData);

    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual(mockRow);
  });

  test("throws error when query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));

    await expect(ProfileModel.createUser(profileData)).rejects.toThrow(
      "DB error"
    );
  });
});

describe("ProfileModel.updateUser", () => {
  test("throws error when updateData is empty", async () => {
    await expect(ProfileModel.updateUser("john", {})).rejects.toThrow(
      "No fields to update"
    );
  });

  test("successfully updates user", async () => {
    pool.query.mockResolvedValue({ rows: [{ username: "john" }] });

    const result = await ProfileModel.updateUser("john", { age: 30 });

    expect(pool.query).toHaveBeenCalled();
    expect(result).toBe("john");
  });

  test("throws error when query fails", async () => {
    pool.query.mockRejectedValue(new Error("Update failed"));

    await expect(ProfileModel.updateUser("john", { age: 30 })).rejects.toThrow(
      "Update failed"
    );
  });
});

describe("ProfileModel.deleteUser", () => {
  test("successfully deletes user", async () => {
    const mockRow = { username: "john" };
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await ProfileModel.deleteUser("john");

    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ["john"]);
    expect(result).toEqual(mockRow);
  });

  test("throws error when delete fails", async () => {
    pool.query.mockRejectedValue(new Error("Delete failed"));

    await expect(ProfileModel.deleteUser("john")).rejects.toThrow(
      "Delete failed"
    );
  });
});

// INTERACTIONS MODEL TESTS

describe("InteractionsModel.likeUser", () => {
  test("successfully likes user", async () => {
    pool.query.mockResolvedValue({});

    const result = await InteractionsModel.likeUser("alice", "bob");

    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual({
      message: "User alice liked user bob",
    });
  });

  test("throws error on failure", async () => {
    pool.query.mockRejectedValue(new Error("Like failed"));

    await expect(InteractionsModel.likeUser("alice", "bob")).rejects.toThrow(
      "Like failed"
    );
  });
});

describe("InteractionsModel.dislikeUser", () => {
  test("successfully dislikes user", async () => {
    pool.query.mockResolvedValue({});

    const result = await InteractionsModel.dislikeUser("alice", "bob");

    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual({
      message: "User alice disliked user bob",
    });
  });

  test("throws error on failure", async () => {
    pool.query.mockRejectedValue(new Error("Dislike failed"));

    await expect(InteractionsModel.dislikeUser("alice", "bob")).rejects.toThrow(
      "Dislike failed"
    );
  });
});

describe("InteractionsModel.blockUser", () => {
  test("successfully blocks user", async () => {
    pool.query.mockResolvedValue({});

    const result = await InteractionsModel.blockUser("alice", "bob");

    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual({
      message: "User alice blocked user bob",
    });
  });

  test("throws error on failure", async () => {
    pool.query.mockRejectedValue(new Error("Block failed"));

    await expect(InteractionsModel.blockUser("alice", "bob")).rejects.toThrow(
      "Block failed"
    );
  });
});
