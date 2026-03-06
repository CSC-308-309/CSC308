// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

import pool from "../../db/index.js";
import { InteractionsModel } from "../Interactions.js";

const timestamp = Date.now();
const aliceUsername = `alice_${timestamp}`;
const bobUsername = `bob_${timestamp}`;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("InteractionsModel", () => {
  test("likeUser works correctly", async () => {
    const insertRow = { id: 10, interaction_type: "like" };
    pool.query
      .mockResolvedValueOnce({ rows: [insertRow] })
      .mockResolvedValueOnce({ rows: [{ is_match: false }] });

    const result = await InteractionsModel.likeUser(aliceUsername, bobUsername);

    expect(result).toEqual({
      success: true,
      isMatch: false,
      message: `User ${aliceUsername} liked user ${bobUsername}`,
      interaction: insertRow,
    });
  });

  test("dislikeUser works correctly", async () => {
    const insertRow = { id: 11, interaction_type: "dislike" };
    pool.query.mockResolvedValueOnce({ rows: [insertRow] });

    const result = await InteractionsModel.dislikeUser(
      aliceUsername,
      bobUsername,
    );

    expect(result).toEqual({
      success: true,
      message: `User ${aliceUsername} disliked user ${bobUsername}`,
      interaction: insertRow,
    });
  });

  test("blockUser works correctly", async () => {
    const insertRow = { id: 12, interaction_type: "block" };
    pool.query.mockResolvedValueOnce({ rows: [insertRow] });

    const result = await InteractionsModel.blockUser(
      aliceUsername,
      bobUsername,
    );

    expect(result).toEqual({
      success: true,
      message: `User ${aliceUsername} blocked user ${bobUsername}`,
      interaction: insertRow,
    });
  });
});

describe("undoInteraction", () => {
  test("returns success true and the deleted row when the interaction exists", async () => {
    const deletedRow = { id: 20, user_id: 1, target_user_id: 2, interaction_type: "like" };
    pool.query.mockResolvedValueOnce({ rows: [deletedRow] });

    const result = await InteractionsModel.undoInteraction(
      aliceUsername, bobUsername, "like"
    );

    expect(result).toEqual({
      success: true,
      deletedCount: 1,
      interaction: deletedRow,
    });
  });

  test("returns success false and null interaction when nothing was deleted", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }); // no rows = nothing existed

    const result = await InteractionsModel.undoInteraction(
      aliceUsername, bobUsername, "like"
    );

    expect(result).toEqual({
      success: false,
      deletedCount: 0,
      interaction: null,
    });
  });

  test("passes all three parameters — usernames and interactionType — to the query", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await InteractionsModel.undoInteraction(aliceUsername, bobUsername, "block");

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      [aliceUsername, bobUsername, "block"]
    );
  });

  test.each(["like", "dislike", "block"])(
    "works for interactionType '%s'",
    async (interactionType) => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1, interaction_type: interactionType }] });

      const result = await InteractionsModel.undoInteraction(
        aliceUsername, bobUsername, interactionType
      );

      expect(result.success).toBe(true);
    }
  );

  test("throws and propagates on DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("Delete failed"));

    await expect(
      InteractionsModel.undoInteraction(aliceUsername, bobUsername, "like")
    ).rejects.toThrow("Delete failed");
  });
});

describe('listMatches', () => { 
  test("returns an array of matched user objects", async () => {
    const matchedUsers = [
      { id: 2, username: bobUsername, email: "bob@test.com", name: "Bob" },
      { id: 3, username: "carol",     email: "carol@test.com", name: "Carol" },
    ];
    pool.query.mockResolvedValueOnce({ rows: matchedUsers });

    const result = await InteractionsModel.listMatches(aliceUsername);

    expect(result).toEqual(matchedUsers);
  });

  test("returns an empty array when the user has no matches", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await InteractionsModel.listMatches(aliceUsername);

    expect(result).toEqual([]);
  });

  test("passes only the username as a query parameter", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await InteractionsModel.listMatches(aliceUsername);

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      [aliceUsername]
    );
  });

  test("throws and propagates on DB error", async () => {
    pool.query.mockRejectedValueOnce(new Error("Query timeout"));

    await expect(
      InteractionsModel.listMatches(aliceUsername)
    ).rejects.toThrow("Query timeout");
  });
});

