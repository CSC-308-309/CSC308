import pool from "../../db/index.js";
import { ProfileModel } from "../Profile.js";

// mock db pool
jest.mock("../../db/index.js", () => ({
  query: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ProfileModel (mocked)", () => {
  test("listUsers returns all users", async () => {
    const mockRows = [{ username: "alice" }, { username: "bob" }];
    pool.query.mockResolvedValue({ rows: mockRows });

    const result = await ProfileModel.listUsers();
    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual(mockRows);
  });

  test("getUserByUsername returns a single user", async () => {
    const mockRow = { username: "alice" };
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await ProfileModel.getUserByUsername("alice");
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ["alice"]);
    expect(result).toEqual(mockRow);
  });

  test("createUser inserts a user and returns it", async () => {
    const profileData = { username: "tom", name: "Tom" };
    const mockRow = { username: "tom" };
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await ProfileModel.createUser(profileData);
    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual(mockRow);
  });

  test("updateUser updates and returns username", async () => {
    pool.query.mockResolvedValue({ rows: [{ username: "tom" }] });

    const result = await ProfileModel.updateUser("tom", { name: "Tom" });
    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual({ username: "tom" });
  });

  test("deleteUser deletes and returns user", async () => {
    const mockRow = { username: "tom" };
    pool.query.mockResolvedValue({ rows: [mockRow] });

    const result = await ProfileModel.deleteUser("tom");
    expect(pool.query).toHaveBeenCalledWith(expect.any(String), ["tom"]);
    expect(result).toEqual(mockRow);
  });
});
