// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  pool: {
    query: jest.fn(),
  },
}));

import { pool } from "../../db/index.js";
import { MusicClipsModel } from "../MusicClips.js";

describe("MusicClipsModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    test("creates music clip successfully", async () => {
      const mockClip = {
        id: 1,
        title: "Test Clip",
        description: "Test Description",
        thumbnail_url: "http://example.com/thumb.jpg",
        media_url: "http://example.com/media.mp4",
        created_at: new Date(),
      };
      
      pool.query
        .mockResolvedValueOnce({ rows: [mockClip] }) // INSERT INTO music_clips
        .mockResolvedValueOnce({ rows: [] }); // INSERT INTO music_clips_intermediate

      const clipData = {
        title: "Test Clip",
        description: "Test Description",
        thumbnail_url: "http://example.com/thumb.jpg",
        media_url: "http://example.com/media.mp4",
      };

      const result = await MusicClipsModel.create(123, clipData);

      expect(result).toEqual(mockClip);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO music_clips"),
        ["Test Clip", "Test Description", "http://example.com/thumb.jpg", "http://example.com/media.mp4"]
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO music_clips_intermediate"),
        [1, 123]
      );
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(MusicClipsModel.create(123, {}))
        .rejects.toThrow(error);
    });
  });

  describe("getMusicClipsById", () => {
    test("returns music clips for user", async () => {
      const mockClips = [
        {
          id: 1,
          title: "Clip 1",
          description: "Description 1",
          thumbnail_url: "http://example.com/thumb1.jpg",
          media_url: "http://example.com/media1.mp4",
        },
        {
          id: 2,
          title: "Clip 2",
          description: "Description 2",
          thumbnail_url: "http://example.com/thumb2.jpg",
          media_url: "http://example.com/media2.mp4",
        },
      ];

      pool.query.mockResolvedValue({ rows: mockClips });

      const result = await MusicClipsModel.getMusicClipsById(123);

      expect(result).toEqual(mockClips);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        [123]
      );
    });

    test("returns empty array when user has no clips", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MusicClipsModel.getMusicClipsById(123);

      expect(result).toEqual([]);
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(MusicClipsModel.getMusicClipsById(123))
        .rejects.toThrow(error);
    });
  });

  describe("updateClip", () => {
    test("updates clip successfully", async () => {
      const mockUpdatedClip = {
        id: 1,
        title: "Updated Title",
        description: "Updated Description",
        thumbnail_url: "http://example.com/thumb.jpg",
        media_url: "http://example.com/media.mp4",
        updated_at: new Date(),
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedClip] });

      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
      };

      const result = await MusicClipsModel.updateClip(1, updateData);

      expect(result).toEqual(mockUpdatedClip);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["Updated Title", "Updated Description", 1])
      );
    });

    test("returns null when no valid fields provided", async () => {
      const result = await MusicClipsModel.updateClip(1, { invalidField: "value" });

      expect(result).toBeNull();
      expect(pool.query).not.toHaveBeenCalled();
    });

    test("filters out undefined values", async () => {
      const mockUpdatedClip = {
        id: 1,
        title: "Updated Title",
        description: "Updated Description",
        updated_at: new Date(),
      };

      pool.query.mockResolvedValue({ rows: [mockUpdatedClip] });

      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
        media_url: undefined,
      };

      const result = await MusicClipsModel.updateClip(1, updateData);

      expect(result).toEqual(mockUpdatedClip);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("title = $1, description = $2, updated_at = NOW()"),
        expect.arrayContaining(["Updated Title", "Updated Description", 1])
      );
    });

    test("returns null when clip not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await MusicClipsModel.updateClip(999, { title: "Updated Title" });

      expect(result).toBeNull();
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(MusicClipsModel.updateClip(1, { title: "Updated Title" }))
        .rejects.toThrow(error);
    });
  });

  describe("delete", () => {
    test("deletes clip successfully", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // DELETE FROM music_clips_intermediate
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // DELETE FROM music_clips

      const result = await MusicClipsModel.delete(1);

      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM music_clips_intermediate WHERE music_clip_id = $1",
        [1]
      );
      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM music_clips WHERE id = $1 RETURNING id",
        [1]
      );
    });

    test("returns false when clip not found", async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // DELETE FROM music_clips_intermediate
        .mockResolvedValueOnce({ rows: [] }); // DELETE FROM music_clips

      const result = await MusicClipsModel.delete(999);

      expect(result).toBe(false);
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);

      await expect(MusicClipsModel.delete(1))
        .rejects.toThrow(error);
    });
  });
});
