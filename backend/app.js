import express from "express";
import cors from "cors";
import { presignUpload } from "./models/media.js";

export function createApp({ db }) {

  const app = express();

  // When frontend uses credentials: "include", origin cannot be "*" — must be exact origin
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());

  // basic test
  app.get("/", (req, res) => res.send("Hello World!"));

  //// AUTH ROUTES ////
  // NOTE: Auth routes are handled in routes/auth.js and mounted in server.js

  //// USER ROUTES ////
  // Update profile (after signup) — user row already exists in users; we only set profile fields
  app.post("/profile", async (req, res) => {
    try {
      const body = req.body;
      const username = body.username;
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }

      const toInt = (v) => {
        if (v == null || v === "") return null;
        const n = Number(v);
        return Number.isNaN(n) ? null : n;
      };

      // Validate required fields and types
      const name = (body.name ?? "").toString().trim();
      const role = (body.role ?? "").toString().trim();
      const age = toInt(body.age);
      const gender = (body.gender ?? "").toString().trim();
      const genre = (body.genre ?? "").toString().trim();
      const experience = toInt(body.experience);
      const mainImage = (body.profileImage ?? body.main_image ?? "").toString().trim();
      const lastSong = (body.favoriteSong ?? body.last_song ?? "").toString().trim();
      const lastSongDesc = (body.songDescription ?? body.last_song_desc ?? "").toString().trim();

      if (!name) return res.status(400).json({ message: "Name is required" });
      if (!role) return res.status(400).json({ message: "Role is required" });
      if (age == null || age < 1) return res.status(400).json({ message: "Age is required and must be a positive integer" });
      if (!gender) return res.status(400).json({ message: "Gender is required" });
      if (!genre) return res.status(400).json({ message: "Genre is required" });
      if (experience == null || experience < 0) return res.status(400).json({ message: "Experience is required and must be a non-negative integer" });
      if (!mainImage) return res.status(400).json({ message: "Profile photo is required" });
      if (!lastSong) return res.status(400).json({ message: "Favorite song is required" });
      if (!lastSongDesc) return res.status(400).json({ message: "Song description is required" });

      const updateData = {
        name,
        role,
        age,
        gender,
        genre,
        experience,
        main_image: mainImage,
        concert_image: body.concert_image ?? "",
        last_song: lastSong,
        last_song_desc: lastSongDesc,
      };
      const updated = await db.Profile.updateUser(username, updateData);
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json(updated);
    } catch (err) {
      console.error("Error in POST /profile:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get all users
  app.get("/users", async (req, res) => {
    const users = await db.Profile.listUsers();
    res.json(users);
  });

  // Get user by ID
  app.get("/users/:username", async (req, res) => {
    const user = await db.Profile.getUserByUsername(req.params.username);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  });

  // Update user (profile info) by username
  app.put("/users/:username", async (req, res) => {
    const updatedUser = await db.Profile.updateUser(req.params.username, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send("User not found");
    }
  });

  // Delete user by ID
  app.delete("/users/:username", async (req, res) => {
    const success = await db.Profile.deleteUser(req.params.username);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("User not found");
    }
  });

  // Push image URL to database
  app.put("/users/:username/coverPhoto", async (req, res) => {
    const updatedUser = await db.Profile.updateCoverPhoto(req.params.username, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send("User not found");
    }
  });

  // Get presigned URL for S3 upload
  app.put("/media/presign", presignUpload);

  //// INTERACTION ROUTES ////
  // Like another user
  app.post("/users/:username/like", async (req, res) => {
    try {
      const actor = await db.Profile.getUserByUsername(req.params.username);
      if (!actor) return res.status(404).json({ error: "User not found", username: req.params.username });

      const target = await db.Profile.getUserByUsername(req.body.targetUsername);
      if (!target) return res.status(400).json({ error: "Target user does not exist", targetUsername: req.body.targetUsername });

      const result = await db.Interactions.likeUser(req.params.username, req.body.targetUsername);
      res.json(result);
    } catch (err) {
      console.error("Error in like route:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dislike another user
  app.post("/users/:username/dislike", async (req, res) => {
    try {
      const actor = await db.Profile.getUserByUsername(req.params.username);
      if (!actor) return res.status(404).json({ error: "User not found", username: req.params.username });

      const target = await db.Profile.getUserByUsername(req.body.targetUsername);
      if (!target) return res.status(400).json({ error: "Target user does not exist", targetUsername: req.body.targetUsername });

      const result = await db.Interactions.dislikeUser(req.params.username, req.body.targetUsername);
      res.json(result);
    } catch (err) {
      console.error("Error in dislike route:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Block another user
  app.post("/users/:username/block", async (req, res) => {
    try {
      const actor = await db.Profile.getUserByUsername(req.params.username);
      if (!actor) return res.status(404).json({ error: "User not found", username: req.params.username });

      const target = await db.Profile.getUserByUsername(req.body.targetUsername);
      if (!target) return res.status(400).json({ error: "Target user does not exist", targetUsername: req.body.targetUsername });

      const result = await db.Interactions.blockUser(req.params.username, req.body.targetUsername);
      res.json(result);
    } catch (err) {
      console.error("Error in block route:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  //// MESSAGE ROUTES ////
  // Fetch chat history
  app.get("messages/:conversationId", async (req, res) => {
    const messages = await db.Messages.getMessages(req.params.conversationId);
    res.json(messages);
  });

  // Send a message
  app.post("messages", async (req, res) => {
    const newMessage = await db.Messages.sendMessage(req.body); // body will have fromUser, toUser, text
    res.status(201).json(newMessage);
  });


  //// EVENT ROUTES ////
  // List all events
  app.get("/events", async (req, res) => {
    const events = await db.Events.listEvents();
    res.json(events);
  });

  // Create new event
  app.post("/events", async (req, res) => {
    const newEvent = await db.Events.createEvent(req.body);
    res.status(201).json(newEvent);
  }); 

  // Attend an event
  app.post("/events/:id/join", async (req, res) => {
    const result = await db.Events.joinEvent(req.params.id, req.body.userId);
    res.json(result);
  });


  //// BAND ROUTES ////
  // List all bands
  app.get("/bands", async (req, res) => {
    const bands = await db.Bands.listBands();
    res.json(bands);
  });

  // Create new band
  app.post("/bands", async (req, res) => {
    const newBand = await db.BandscreateBand(req.body);
    res.status(201).json(newBand);
  });

  // Join a band
  app.post("/bands/:id/join", async (req, res) => {
    const result = await db.Bands.joinBand(req.params.id, req.body.userId);
    res.json(result);
  });



  return app;
}

