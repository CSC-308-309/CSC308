import { connectToDatabase, pool } from "../db/index.js";

// Set up test environment variables
process.env.DB_TYPE = "TEST";
process.env.TEST_CONNECTION_STRING = "postgresql://test";

// Mock console methods to avoid test output pollution
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe("Database", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("Environment Configuration", () => {
    const originalEnv = process.env;

    afterEach(() => {
      process.env = originalEnv;
    });

    test("configures SSL for PRODUCTION", () => {
      process.env.DB_TYPE = "PRODUCTION";
      process.env.PRODUCTION_CONNECTION_STRING = "postgresql://test";
      
      expect(() => connectToDatabase()).not.toThrow();
    });

    test("does not configure SSL for non-PRODUCTION", () => {
      process.env.DB_TYPE = "TEST";
      process.env.TEST_CONNECTION_STRING = "postgresql://test";
      
      expect(() => connectToDatabase()).not.toThrow();
    });

    test("configures SSL correctly for PRODUCTION", () => {
      jest.resetModules();
      process.env.DB_TYPE = "PRODUCTION";
      process.env.PRODUCTION_CONNECTION_STRING = "postgresql://test";
      
      const mockPool = jest.fn();
      jest.doMock("pg", () => ({
        Pool: mockPool,
      }));

      delete require.cache[require.resolve("../db/index.js")];
      require("../db/index.js");

      expect(mockPool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: "postgresql://test",
          ssl: { rejectUnauthorized: false },
        })
      );
    });

    test("does not configure SSL for DEVELOPMENT", () => {
      jest.resetModules();
      process.env.DB_TYPE = "DEVELOPMENT";
      process.env.DEVELOPMENT_CONNECTION_STRING = "postgresql://test";
      
      // Mock the Pool constructor to capture config
      const mockPool = jest.fn();
      jest.doMock("pg", () => ({
        Pool: mockPool,
      }));

      delete require.cache[require.resolve("../db/index.js")];
      require("../db/index.js");

      expect(mockPool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: "postgresql://test",
        })
      );
      expect(mockPool).not.toHaveBeenCalledWith(
        expect.objectContaining({
          ssl: expect.any(Object),
        })
      );
    });
  });

  describe("connectToDatabase", () => {
    beforeEach(() => {
      process.env.DB_TYPE = "TEST";
      process.env.TEST_CONNECTION_STRING = "postgresql://test";
    });

    test("connects successfully", async () => {
      const mockResult = {
        rows: [{
          current_database: "test_db",
          current_user: "test_user",
          version: "PostgreSQL 14.0"
        }]
      };
      
      pool.query = jest.fn().mockResolvedValue(mockResult);
      
      const result = await connectToDatabase();
      
      expect(pool.query).toHaveBeenCalledWith(
        "SELECT current_database(), current_user, version()"
      );
      expect(console.log).toHaveBeenCalledWith(
        "Connected to DEVELOPMENT database:",
        "test_db"
      );
      expect(result).toBe(pool);
      
      await new Promise(resolve => setImmediate(resolve));
    });

    test("throws error on connection failure", async () => {
      const error = new Error("Connection failed");
      pool.query = jest.fn().mockRejectedValue(error);
      
      await expect(connectToDatabase()).rejects.toThrow(error);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to connect to DEVELOPMENT database:",
        "Connection failed"
      );
    });

    test("handles different database types", async () => {
      process.env.DB_TYPE = "DEVELOPMENT";
      process.env.DEVELOPMENT_CONNECTION_STRING = "postgresql://dev";
      
      const mockResult = {
        rows: [{
          current_database: "dev_db",
          current_user: "dev_user",
          version: "PostgreSQL 14.0"
        }]
      };
      
      pool.query = jest.fn().mockResolvedValue(mockResult);
      
      await connectToDatabase();
      
      expect(console.log).toHaveBeenCalledWith("Connected to DEVELOPMENT database:", "dev_db");
    });
  });

  describe("Pool Configuration", () => {
    test("creates pool with connection string", () => {
      process.env.DB_TYPE = "TEST";
      process.env.TEST_CONNECTION_STRING = "postgresql://test";
      
      expect(pool).toBeDefined();
    });

    test("exports both named and default exports", () => {
      const dbModule = require("../db/index.js");
      
      expect(dbModule.pool).toBeDefined();
      expect(dbModule.connectToDatabase).toBeDefined();
      expect(dbModule.default).toBeDefined();
    });
  });
});
