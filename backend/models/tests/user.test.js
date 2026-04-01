// MUST be first
jest.mock("../../db/index.js", () => ({
  __esModule: true,
  pool: {
    query: jest.fn(),
  },
}));

import { pool } from "../../db/index.js";
import { UsersModel } from "../User.js";
import bcrypt from "bcrypt";

describe("UsersModel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUsernameFormat", () => {
    test("returns true for valid usernames", () => {
      expect(UsersModel.validateUsernameFormat("user123")).toBe(true);
      expect(UsersModel.validateUsernameFormat("test_user")).toBe(true);
      expect(UsersModel.validateUsernameFormat("abc")).toBe(true);
      expect(UsersModel.validateUsernameFormat("a".repeat(30))).toBe(true);
    });

    test("returns false for invalid usernames", () => {
      expect(UsersModel.validateUsernameFormat("ab")).toBe(false); // too short
      expect(UsersModel.validateUsernameFormat("a".repeat(31))).toBe(false); // too long
      expect(UsersModel.validateUsernameFormat("user-123")).toBe(false); // contains dash
      expect(UsersModel.validateUsernameFormat("user@123")).toBe(false); // contains special char
      expect(UsersModel.validateUsernameFormat("user 123")).toBe(false); // contains space
      expect(UsersModel.validateUsernameFormat("")).toBe(false); // empty
      expect(UsersModel.validateUsernameFormat(null)).toBe(false); // null
    });
  });

  describe("checkUsernameExists", () => {
    test("returns true when username exists", async () => {
      pool.query.mockResolvedValue({ rows: [{ username: "testuser" }] });
      
      const result = await UsersModel.checkUsernameExists("testuser");
      
      expect(result).toBe(true);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ["testuser"]
      );
      expect(pool.query.mock.calls[0][0]).toContain("SELECT username FROM users WHERE username = $1");
    });

    test("returns false when username does not exist", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.checkUsernameExists("nonexistent");
      
      expect(result).toBe(false);
    });

    test("throws error when database query fails", async () => {
      const error = new Error("Database error");
      pool.query.mockRejectedValue(error);
      
      await expect(UsersModel.checkUsernameExists("testuser")).rejects.toThrow(error);
    });
  });

  describe("validateUser", () => {
    test("returns user object for valid credentials", async () => {
      const mockUser = {
        username: "testuser",
        password_hash: "$2b$10$hashedpassword",
      };
      pool.query.mockResolvedValue({ rows: [mockUser] });
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      
      const result = await UsersModel.validateUser("testuser", "password");
      
      expect(result).toEqual({ username: "testuser" });
      expect(bcrypt.compare).toHaveBeenCalledWith("password", "$2b$10$hashedpassword");
    });

    test("returns null for invalid username format", async () => {
      const result = await UsersModel.validateUser("ab", "password");
      
      expect(result).toBeNull();
      expect(pool.query).not.toHaveBeenCalled();
    });

    test("returns null when user not found", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.validateUser("testuser", "password");
      
      expect(result).toBeNull();
    });

    test("returns null for invalid password", async () => {
      const mockUser = {
        username: "testuser",
        password_hash: "$2b$10$hashedpassword",
      };
      pool.query.mockResolvedValue({ rows: [mockUser] });
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
      
      const result = await UsersModel.validateUser("testuser", "wrongpassword");
      
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    test("creates user successfully", async () => {
      const mockCreatedUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        created_at: new Date(),
      };
      pool.query.mockResolvedValue({ rows: [mockCreatedUser] });
      jest.spyOn(UsersModel, "checkUsernameExists").mockResolvedValue(false);
      
      const result = await UsersModel.createUser("test@example.com", "hashedpass", "testuser");
      
      expect(result).toEqual(mockCreatedUser);
      expect(UsersModel.checkUsernameExists).toHaveBeenCalledWith("testuser");
    });

    test("throws error for invalid username format", async () => {
      await expect(UsersModel.createUser("test@example.com", "hashedpass", "ab"))
        .rejects.toThrow("Invalid username format");
    });

    test("throws error when username already exists", async () => {
      jest.spyOn(UsersModel, "checkUsernameExists").mockResolvedValue(true);
      
      await expect(UsersModel.createUser("test@example.com", "hashedpass", "testuser"))
        .rejects.toThrow("Username already exists");
    });
  });

  describe("findUserByEmail", () => {
    test("returns user when email exists", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };
      pool.query.mockResolvedValue({ rows: [mockUser] });
      
      const result = await UsersModel.findUserByEmail("test@example.com");
      
      expect(result).toEqual(mockUser);
    });

    test("returns null when email does not exist", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.findUserByEmail("nonexistent@example.com");
      
      expect(result).toBeNull();
    });
  });

  describe("listUsers", () => {
    test("returns list of users", async () => {
      const mockUsers = [
        { id: 1, username: "user1" },
        { id: 2, username: "user2" },
      ];
      pool.query.mockResolvedValue({ rows: mockUsers });
      
      const result = await UsersModel.listUsers();
      
      expect(result).toEqual(mockUsers);
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String)
      );
    });
  });

  describe("getUserByUsername", () => {
    test("returns user when username exists", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };
      pool.query.mockResolvedValue({ rows: [mockUser] });
      
      const result = await UsersModel.getUserByUsername("testuser");
      
      expect(result).toEqual(mockUser);
    });

    test("returns null when username does not exist", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.getUserByUsername("nonexistent");
      
      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    test("updates user successfully", async () => {
      const mockUpdatedUser = {
        id: 1,
        username: "testuser",
        name: "Updated Name",
      };
      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });
      
      const result = await UsersModel.updateUser("testuser", { name: "Updated Name" });
      
      expect(result).toEqual(mockUpdatedUser);
    });

    test("returns null when no valid fields provided", async () => {
      const result = await UsersModel.updateUser("testuser", { invalidField: "value" });
      
      expect(result).toBeNull();
      expect(pool.query).not.toHaveBeenCalled();
    });

    test("filters out undefined values", async () => {
      const mockUpdatedUser = {
        id: 1,
        username: "testuser",
        name: "Updated Name",
      };
      pool.query.mockResolvedValue({ rows: [mockUpdatedUser] });
      
      const result = await UsersModel.updateUser("testuser", {
        name: "Updated Name",
        age: undefined,
      });
      
      expect(result).toEqual(mockUpdatedUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("name = $1"),
        expect.arrayContaining(["Updated Name", "testuser"])
      );
    });
  });

  describe("deleteUser", () => {
    test("deletes user successfully", async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      
      const result = await UsersModel.deleteUser("testuser");
      
      expect(result).toBe(true);
    });

    test("returns false when user does not exist", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.deleteUser("nonexistent");
      
      expect(result).toBe(false);
    });
  });

  describe("getNotificationPreferences", () => {
    test("returns notification preferences", async () => {
      const mockPrefs = { email: true, push: false };
      pool.query.mockResolvedValue({ rows: [{ notification_preferences: mockPrefs }] });
      
      const result = await UsersModel.getNotificationPreferences("testuser");
      
      expect(result).toEqual(mockPrefs);
    });

    test("returns empty object when no preferences exist", async () => {
      pool.query.mockResolvedValue({ rows: [{}] });
      
      const result = await UsersModel.getNotificationPreferences("testuser");
      
      expect(result).toEqual({});
    });
  });

  describe("updateNotificationPreferences", () => {
    test("updates notification preferences successfully", async () => {
      const mockPrefs = { email: true, push: false };
      pool.query.mockResolvedValue({ rows: [{ notification_preferences: mockPrefs }] });
      
      const result = await UsersModel.updateNotificationPreferences("testuser", mockPrefs);
      
      expect(result).toEqual(mockPrefs);
    });
  });

  describe("getPasswordHashByUsername", () => {
    test("returns password hash", async () => {
      const mockHash = "$2b$10$hashedpassword";
      pool.query.mockResolvedValue({ rows: [{ password_hash: mockHash }] });
      
      const result = await UsersModel.getPasswordHashByUsername("testuser");
      
      expect(result).toBe(mockHash);
    });

    test("returns null when user does not exist", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.getPasswordHashByUsername("nonexistent");
      
      expect(result).toBeNull();
    });
  });

  describe("updatePasswordHashByUsername", () => {
    test("updates password hash successfully", async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      
      const result = await UsersModel.updatePasswordHashByUsername("testuser", "newhash");
      
      expect(result).toBe(true);
    });

    test("returns false when user does not exist", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.updatePasswordHashByUsername("nonexistent", "newhash");
      
      expect(result).toBe(false);
    });
  });

  describe("updateEmailByUsername", () => {
    test("updates email successfully", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "newemail@example.com",
      };
      pool.query.mockResolvedValue({ rows: [mockUser] });
      
      const result = await UsersModel.updateEmailByUsername("testuser", "newemail@example.com");
      
      expect(result).toEqual(mockUser);
    });

    test("returns null when user does not exist", async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      const result = await UsersModel.updateEmailByUsername("nonexistent", "newemail@example.com");
      
      expect(result).toBeNull();
    });
  });
});
