import pool from "../../db/index.js";
import { InteractionsModel } from "../Interactions.js";

// mock db pool
jest.mock("../../db/index.js", () => ({
  query: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("InteractionsModel (mocked)", () => {
  test("likeUser succeeds", async () => {
    const insertRow = { id: 1, interaction_type: "like" };
    pool.query
      .mockResolvedValueOnce({ rows: [insertRow] })
      .mockResolvedValueOnce({ rows: [{ is_match: false }] });
    const result = await InteractionsModel.likeUser("alice", "bob");
    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      isMatch: false,
      message: "User alice liked user bob",
      interaction: insertRow,
    });
  });

  test("likeUser throws error on failure", async () => {
    pool.query.mockRejectedValue(new Error("Like failed"));
    await expect(InteractionsModel.likeUser("alice", "bob")).rejects.toThrow(
      "Like failed",
    );
  });

  test("dislikeUser succeeds", async () => {
    const insertRow = { id: 2, interaction_type: "dislike" };
    pool.query.mockResolvedValueOnce({ rows: [insertRow] });
    const result = await InteractionsModel.dislikeUser("alice", "bob");
    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: "User alice disliked user bob",
      interaction: insertRow,
    });
  });

  test("dislikeUser throws error on failure", async () => {
    pool.query.mockRejectedValue(new Error("Dislike failed"));
    await expect(InteractionsModel.dislikeUser("alice", "bob")).rejects.toThrow(
      "Dislike failed",
    );
  });

  test("blockUser succeeds", async () => {
    const insertRow = { id: 3, interaction_type: "block" };
    pool.query.mockResolvedValueOnce({ rows: [insertRow] });
    const result = await InteractionsModel.blockUser("alice", "bob");
    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: "User alice blocked user bob",
      interaction: insertRow,
    });
  });

  test("blockUser throws error on failure", async () => {
    pool.query.mockRejectedValue(new Error("Block failed"));
    await expect(InteractionsModel.blockUser("alice", "bob")).rejects.toThrow(
      "Block failed",
    );
  });
});
