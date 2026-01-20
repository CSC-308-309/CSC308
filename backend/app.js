import express from "express";
import cors from "cors";

export function createApp({ db }) {

  const app = express();

  app.use(cors());
  app.use(express.json());

  // basic test
  app.get("/", (req, res) => res.send("Hello World!"));

  //// AUTH ROUTES ////
  // NOTE: Auth routes are handled in routes/auth.js and mounted in server.js

  //// USER ROUTES ////
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
  // app.get("messages/:conversationId", async (req, res) => {
  //   const messages = await db.Messages.getMessages(req.params.conversationId);
  //   res.json(messages);
  // });

  // // Send a message
  // app.post("messages", async (req, res) => {
  //   const newMessage = await db.Messages.sendMessage(req.body); // body will have fromUser, toUser, text
  //   res.status(201).json(newMessage);
  // });
  app.get("/chats", async (req, res) => {
    const chats = await db.Messages.listChats(req.query);
    res.json(chats);
  });

  app.post("/chats", async (req, res) => {
    const newChat = await db.Messages.createChat(req.body);
    res.status(201).json(newChat);
  });

  app.get("/chats/:chatId", async (req, res) => {
    const chat = await db.Messages.getChat(req.params.chatId);
    if (chat) {
      res.json(chat);
    } else {
      res.status(404).send("Chat not found");
    }
  });
  
  app.patch("/chats/:chatId", async (req, res) => {
    const updatedChat = await db.Messages.updateChat(req.params.chatId, req.body);
    if (updatedChat) {
      res.json(updatedChat);
    } else {
      res.status(404).send("Chat not found");
    }
  });
  
  app.delete("/chats/:chatId", async (req, res) => {
    const success = await db.Messages.deleteChat(req.params.chatId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("Chat not found");
    }
  });

  app.get("/chats/:chatId/participants", async (req, res) => {
    const participants = await db.Messages.listChatParticipants(req.params.chatId);
    res.json(participants);
  });

  app.post("/chats/:chatId/participants", async (req, res) => {
    const result = await db.Messages.addChatParticipants(req.params.chatId, req.body);
    res.json(result);
  });

  app.delete("/chats/:chatId/participants/:username", async (req, res) => {
    const success = await db.Messages.removeChatParticipant(req.params.chatId, req.params.username);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("Participant or chat not found");
    }
  });

  app.get("/chats/:chatId/messages", async (req, res) => {
    const messages = await db.Messages.listMessages(req.params.chatId, req.query);
    res.json(messages);
  });

  app.get("/chats/:chatId/messages/:messageId", async (req, res) => {
    const message = await db.Messages.getMessage(req.params.chatId, req.params.messageId);
    if (message) {
      res.json(message);
    } else {
      res.status(404).send("Message not found");
    }
  });
  
  app.post("/chats/:chatId/messages", async (req, res) => {
    const newMessage = await db.Messages.sendMessage(req.params.chatId, req.body);
    res.status(201).json(newMessage);
  });

  app.patch("/chats/:chatId/messages/:messageId", async (req, res) => {
    const updatedMessage = await db.Messages.updateMessage(req.params.chatId, req.params.messageId, req.body);
    if (updatedMessage) {
      res.json(updatedMessage);
    } else {
      res.status(404).send("Message not found");
    }
  });
  
  app.delete("/chats/:chatId/messages/:messageId", async (req, res) => {
    const success = await db.Messages.deleteMessage(req.params.chatId, req.params.messageId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("Message not found");
    }
  });

  app.post("/chats/:chatId/read", async (req, res) => {
    const result = await db.Messages.markChatRead(req.params.chatId, req.body);
    res.json(result);
  });

  app.post("/chats/:chatId/typing", async (req, res) => {
    const result = await db.Messages.setTyping(req.params.chatId, req.body);
    res.json(result);
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

