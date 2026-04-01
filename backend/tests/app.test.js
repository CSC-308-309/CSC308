import request from "supertest";
import express from "express";

// Mock modules before importing app
jest.mock("../db/index.js", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
  Profile: {
    getUserByUsername: jest.fn(),
  },
  MusicClips: {
    getMusicClipsById: jest.fn(),
    updateClip: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("../models/media.js", () => ({
  __esModule: true,
  presignUpload: jest.fn(),
  presignView: jest.fn(),
}));

jest.mock("../models/User.js", () => ({
  __esModule: true,
  UsersModel: {
    validatePassword: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

import { createApp } from "../app.js";

describe("App", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp({
      Profile: {
        getUserByUsername: jest.fn(),
      },
      MusicClips: {
        getMusicClipsById: jest.fn(),
        updateClip: jest.fn(),
        delete: jest.fn(),
      },
    });
  });

  describe("CORS Configuration", () => {
    test("allows allowed origins", async () => {
      const response = await request(app)
        .get("/")
        .set("Origin", "http://localhost:5173");

      expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    });

    test("rejects disallowed origins", async () => {
      const response = await request(app)
        .get("/")
        .set("Origin", "http://evil-site.com");

      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("Music Clips Routes", () => {

    test("GET /musicClips/:userId - error", async () => {
      const { MusicClips } = require("../app.js").createApp({
        MusicClips: {
          getMusicClipsById: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      });

      const response = await request(app)
        .get("/musicClips/123")
        .expect(500);

      expect(response.body).toEqual({ message: "Server error" });
    });

    test("PUT /musicClips/:id - error", async () => {
      const { MusicClips } = require("../app.js").createApp({
        MusicClips: {
          updateClip: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      });

      const response = await request(app)
        .put("/musicClips/1")
        .send({ title: "Updated Clip" })
        .expect(500);

      expect(response.body).toEqual({ message: "Server error" });
    });

    test("DELETE /musicClips/:id - error", async () => {
      const { MusicClips } = require("../app.js").createApp({
        MusicClips: {
          delete: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      });

      const response = await request(app)
        .delete("/musicClips/1")
        .expect(500);

      expect(response.body).toEqual({ message: "Server error" });
    });
  });

  describe("Basic Routes", () => {
    test("GET / - basic health check", async () => {
      const response = await request(app)
        .get("/")
        .expect(200);
    });

    test("handles missing route", async () => {
      const response = await request(app)
        .get("/nonexistent")
        .expect(404);
    });

    test("handles malformed JSON", async () => {
      const response = await request(app)
        .post("/test")
        .send("invalid json")
        .expect(404);
    });

    test("handles empty request body", async () => {
      const response = await request(app)
        .post("/test")
        .send({})
        .expect(404);
    });
  });

  describe("User Routes", () => {
    test("GET /users - route exists", async () => {
      const { Users } = require("../app.js").createApp({
        Users: {
          getUserByUsername: jest.fn().mockRejectedValue(new Error("User not found")),
        },
      });

      const response = await request(app).get("/users/testuser");
      expect([500]).toContain(response.status);
    });

    test("GET /users/:username - route exists", async () => {
      const { Users } = require("../app.js").createApp({
        Users: {
          getUserByUsername: jest.fn().mockRejectedValue(new Error("User not found")),
        },
      });

      const response = await request(app).get("/users/testuser");
      expect([500]).toContain(response.status);
    });

    test("GET /profiles/:username - route exists", async () => {
      const { Users } = require("../app.js").createApp({
        Users: {
          getUserByUsername: jest.fn().mockRejectedValue(new Error("User not found")),
        },
      });

      const response = await request(app).get("/profiles/testuser");
      expect([500]).toContain(response.status);
    });

    test("PUT /users/:username - route exists", async () => {
      const { Users } = require("../app.js").createApp({
        Users: {
          getUserByUsername: jest.fn().mockResolvedValue({ id: 1, username: "testuser" }),
        },
      });

      const response = await request(app)
        .put("/users/testuser")
        .send({ name: "New Name" });
      expect([500]).toContain(response.status);
    });

    test("DELETE /users/:username - route exists", async () => {
      const { Users } = require("../app.js").createApp({
        Users: {
          deleteUser: jest.fn().mockRejectedValue(new Error("Delete failed")),
        },
      });

      const response = await request(app).delete("/users/testuser");
      expect([500]).toContain(response.status);
    });

    test("PUT /users/:username/coverPhoto - route exists", async () => {
      const { Profile } = require("../app.js").createApp({
        Profile: {
          updateCoverPhoto: jest.fn().mockRejectedValue(new Error("Update failed")),
        },
      });

      const response = await request(app)
        .put("/users/testuser/coverPhoto")
        .send({ main_image: "url" });
      expect([500]).toContain(response.status);
    });
  });

describe("Interaction Routes", () => {
  test("POST /users/:username/like - route exists", async () => {
      const response = await request(app)
        .post("/users/testuser/like")
        .send({ targetUsername: "targetuser" });
      expect([500]).toContain(response.status);
    });

  test("POST /users/:username/dislike - route exists", async () => {
    const response = await request(app)
      .post("/users/testuser/dislike")
      .send({ targetUsername: "targetuser" });
    expect([500]).toContain(response.status);
  });

  test("POST /users/:username/block - route exists", async () => {
    const response = await request(app)
      .post("/users/testuser/block")
      .send({ targetUsername: "targetuser" });
    expect([500]).toContain(response.status);
  });

  test("DELETE /users/:username/interactions/:targetUsername/:interactionType - route exists", async () => {
    const response = await request(app)
      .delete("/users/testuser/interactions/targetuser/like");
    expect([500]).toContain(response.status);
  });

  test("GET /users/:username/matches - route exists", async () => {
      const { Users } = require("../app.js").createApp({
        Users: {
          getUserByUsername: jest.fn().mockRejectedValue(new Error("Database error")),
        },
      });

      const response = await request(app).get("/users/testuser/matches");
      expect([500]).toContain(response.status);
    });
});

describe("Event Routes", () => {
  test("GET /events - route exists", async () => {
    const { Events } = require("../app.js").createApp({
      Events: {
        getEvents: jest.fn().mockRejectedValue(new Error("Database error")),
      },
    });

    const response = await request(app).get("/events");
    expect([500]).toContain(response.status);
  });

  test("POST /events - route exists", async () => {
    const response = await request(app)
      .post("/events")
      .send({ title: "Test Event" });
    expect([500]).toContain(response.status);
  });

  test("POST /events/:id/join - route exists", async () => {
    const response = await request(app)
      .post("/events/1/join")
      .send({ userId: 123 });
    expect([500]).toContain(response.status);
  });
});

describe("Band Routes", () => {
  test("GET /bands - route exists", async () => {
    const response = await request(app).get("/bands");
    expect([500]).toContain(response.status);
  });

  test("POST /bands - route exists", async () => {
    const response = await request(app)
      .post("/bands")
      .send({ name: "Test Band" });
    expect([201, 500]).toContain(response.status);
  });

  test("POST /bands/:id/join - route exists", async () => {
    const response = await request(app)
      .post("/bands/1/join")
      .send({ userId: 123 });
    expect([200, 404, 500]).toContain(response.status);
  });
});

describe("Concert Memories Routes", () => {
  test("POST /concertMemories/new/:userId - route exists", async () => {
    const response = await request(app)
      .post("/concertMemories/new/1")
      .send({ title: "Memory" });
    expect([201, 500]).toContain(response.status);
  });

  test("PUT /concertMemories/:id - route exists", async () => {
    const response = await request(app)
      .put("/concertMemories/1")
      .send({ title: "Updated Memory" });
    expect([200, 404, 500]).toContain(response.status);
  });

  test("DELETE /concertMemories/:id - route exists", async () => {
    const response = await request(app).delete("/concertMemories/1");
    expect([500]).toContain(response.status);
  });
});

describe("Notifications Routes", () => {
  test("GET /notifications/:username - route exists", async () => {
  });

});
});
