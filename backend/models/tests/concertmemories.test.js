// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  pool: {
    query: jest.fn(),
  },
}));

import { pool } from "../../db/index.js";
import { ConcertMemoriesModel } from "../ConcertMemories.js";

describe("ConcertMemoriesModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {

    test("handles database error", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(ConcertMemoriesModel.create(123, {
        title: "Test Concert",
      })).rejects.toThrow(error);
    });
  });

  describe("getConcertMemoriesByUserId", () => {
    test("returns memories for user", async () => {
      const mockMemories = [
        {
          id: 1,
          title: "Concert 1",
          created_at: new Date("2023-01-01"),
        },
        {
          id: 2,
          title: "Concert 2",
          created_at: new Date("2023-01-02"),
        },
      ];
      pool.query.mockResolvedValue({ rows: mockMemories });

      const result = await ConcertMemoriesModel.getConcertMemoriesByUserId(123);

      expect(result).toEqual(mockMemories);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [123]
      );
    });

    test("returns empty array when user has no memories", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await ConcertMemoriesModel.getConcertMemoriesByUserId(123);

      expect(result).toEqual([]);
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(ConcertMemoriesModel.getConcertMemoriesByUserId(123))
        .rejects.toThrow(error);
    });
  });

  describe("updateMemory", () => {
    test("updates memory successfully", async () => {
      const mockUpdatedMemory = {
        id: 1,
        title: "Updated Concert",
        description: "Updated description",
        video_url: "http://example.com/new-video.mp4",
        thumbnail_url: "http://example.com/new-thumb.jpg",
        is_starred: true,
        updated_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockUpdatedMemory] });

      const result = await ConcertMemoriesModel.updateMemory(1, {
        title: "Updated Concert",
        description: "Updated description",
        video_url: "http://example.com/new-video.mp4",
        thumbnail_url: "http://example.com/new-thumb.jpg",
        is_starred: true,
      });

      expect(result).toEqual(mockUpdatedMemory);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          "Updated Concert", "Updated description", 
          "http://example.com/new-video.mp4", "http://example.com/new-thumb.jpg", true, 1
        ])
      );
    });

    test("returns null when no valid fields provided", async () => {
      const result = await ConcertMemoriesModel.updateMemory(1, {
        invalidField: "value",
      });

      expect(result).toBeNull();
      expect(pool.query).not.toHaveBeenCalled();
    });

    test("returns null when memory not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await ConcertMemoriesModel.updateMemory(999, {
        title: "Updated Concert",
      });

      expect(result).toBeNull();
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(ConcertMemoriesModel.updateMemory(1, {
        title: "Updated Concert",
      })).rejects.toThrow(error);
    });
  });

  describe("delete", () => {

    test("returns false when memory not found", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // DELETE FROM concert_memories_intermediate
        .mockResolvedValueOnce({ rows: [] }); // DELETE FROM concert_memories

      const result = await ConcertMemoriesModel.delete(999);

      expect(result).toBe(false);
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(ConcertMemoriesModel.delete(1))
        .rejects.toThrow(error);
    });
  });
});
