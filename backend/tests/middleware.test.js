import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/authMiddleware.js";

// Set up test environment variables
process.env.JWT_SECRET = "test-secret";

// Mock console methods to avoid test output pollution
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe("Auth Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe("authenticate", () => {
    const mockReq = (token = null) => ({
      headers: token ? { authorization: `Bearer ${token}` } : {},
      userId: null,
      username: null,
    });
    
    const mockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn().mockReturnThis();
      return res;
    };
    
    const mockNext = jest.fn();

    beforeEach(() => {
      mockNext.mockClear();
    });

    test("returns 401 when missing authorization header", () => {
      const req = mockReq();
      const res = mockRes();
      
      authenticate(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing token" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("sets req.userId and req.username when token is valid", () => {
      const payload = { userId: 123, username: "testuser" };
      const validToken = jwt.sign(payload, process.env.JWT_SECRET);
      
      const req = mockReq(validToken);
      const res = mockRes();
      
      authenticate(req, res, mockNext);
      
      expect(req.userId).toBe(123);
      expect(req.username).toBe("testuser");
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("returns 401 when token is invalid", () => {
      const req = mockReq("invalidtoken");
      const res = mockRes();
      
      authenticate(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("returns 401 when token is expired", () => {
      const expiredPayload = { userId: 123, username: "testuser", exp: Date.now() / 1000 - 3600 };
      const expiredToken = jwt.sign(expiredPayload, process.env.JWT_SECRET);
      
      const req = mockReq(expiredToken);
      const res = mockRes();
      
      authenticate(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("logs authentication header", () => {
      const token = jwt.sign({ userId: 123, username: "testuser" }, process.env.JWT_SECRET);
      const req = mockReq(token);
      const res = mockRes();
      
      authenticate(req, res, mockNext);
      
      expect(console.log).toHaveBeenCalledWith("AUTH HEADER:", `Bearer ${token}`);
    });

    test("logs decoded token", () => {
      const payload = { userId: 123, username: "testuser" };
      const validToken = jwt.sign(payload, process.env.JWT_SECRET);
      const req = mockReq(validToken);
      const res = mockRes();
      
      authenticate(req, res, mockNext);
      
      expect(console.log).toHaveBeenCalledWith("DECODED:", expect.objectContaining(payload));
    });
  });
});
