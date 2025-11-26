import express from "express";
import cors from "cors";

export function createApp({ db }) {
  if (!db) throw new Error("createApp requires a 'db' dependency");

  const app = express();

  app.use(cors());
  app.use(express.json());

  // basic test
  app.get("/", (req, res) => res.send("Hello World!"));

  //// USER ROUTES ////
  // Get all users
  app.get("/users", async (req, res) => {
    const users = await db.listUsers();
    res.json(users);
  });

  // Get user by ID
  app.get("/users/:id", async (req, res) => {
    const user = await db.getUserById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  });

  // Create new user
  app.post("/users", async (req, res) => {
    const newUser = await db.createUser(req.body);
    res.status(201).json(newUser);
  });

  // Update user by ID
  app.put("/users/:id", async (req, res) => {
    const updatedUser = await db.updateUser(req.params.id, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send("User not found");
    }
  });

  // Delete user by ID
  app.delete("/users/:id", async (req, res) => {
    const success = await db.deleteUser(req.params.id);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("User not found");
    }
  });


  //// INTERACTION ROUTES ////
  // Like another user
  app.post("/users:id/like", async (req, res) => {
    const result = await db.likeUser(req.params.id, req.body.targetUserId);
    res.json(result);
  });

  // Dislike another user
  app.post("/users:id/dislike", async (req, res) => {
    const result = await db.dislikeUser(req.params.id, req.body.targetUserId);
    res.json(result);
  });

  // Block another user
  app.post("/users:id/block", async (req, res) => {
    const result = await db.blockUser(req.params.id, req.body.targetUserId);
    res.json(result);
  });


  //// MESSAGE ROUTES ////
  // Fetch chat history
  app.get("messages/:conversationId", async (req, res) => {
    const messages = await db.getMessages(req.params.conversationId);
    res.json(messages);
  });

  // Send a message
  app.post("messages", async (req, res) => {
    const newMessage = await db.sendMessage(req.body); // body will have fromUserID, toUserID, text
    res.status(201).json(newMessage);
  });


  //// EVENT ROUTES ////
  // List all events
  app.get("/events", async (req, res) => {
    const events = await db.listEvents();
    res.json(events);
  });

  // Create new event
  app.post("/events", async (req, res) => {
    const newEvent = await db.createEvent(req.body);
    res.status(201).json(newEvent);
  }); 

  // Attend an event
  app.post("/events/:id/join", async (req, res) => {
    const result = await db.joinEvent(req.params.id, req.body.userId);
    res.json(result);
  });


  //// BAND ROUTES ////
  // List all bands
  app.get("/bands", async (req, res) => {
    const bands = await db.listBands();
    res.json(bands);
  });

  // Create new band
  app.post("/bands", async (req, res) => {
    const newBand = await db.createBand(req.body);
    res.status(201).json(newBand);
  });

  // Join a band
  app.post("/bands/:id/join", async (req, res) => {
    const result = await db.joinBand(req.params.id, req.body.userId);
    res.json(result);
  });


  //// AUTH ROUTES ////
  // NOTE: THIS MAY NEED CHANGING BASED ON AUTH IMPLEMENTATION NEXT QUARTER
  // User signup
  app.post("/auth/signup", async (req, res) => {
    const newUser = await db.createUser(req.body);
    res.status(201).json(newUser);
  });

  // User login
  app.post("/auth/login", async (req, res) => {
    const user = await db.authenticateUser(req.body.email, req.body.password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).send("Invalid credentials");
    }
  });

  return app;
}
