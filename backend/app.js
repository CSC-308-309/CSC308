import express from "express";
import cors from "cors";
import { presignUpload, presignView } from "./models/media.js";

export function createApp({ db }) {
  const app = express();

  // When frontend uses credentials: "include", origin cannot be "*" — must be exact origin
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json());

  // Helper: validate both current and target users exist for interactions
  async function validateUserInteraction(username, targetUsername) {
    const current = await db.Profile.getUserByUsername(username);
    if (!current) {
      return { error: true, status: 404, message: "User not found", username };
    }

    const target = await db.Profile.getUserByUsername(targetUsername);
    if (!target) {
      return { error: true, status: 400, message: "Target user does not exist", targetUsername };
    }

    return { error: false, current, target };
  }

  // basic test
  app.get("/", (req, res) => res.send("Hello World!"));

  //// AUTH ROUTES ////
  // NOTE: Auth routes are handled in routes/auth.js and mounted in server.js

  //// USER ROUTES ////

  // OLD ROUTE: Use user update route instead
  // Update profile (after signup) — user row already exists in users; we only set profile fields
  // app.post("/profile", async (req, res) => {
  //   try {
  //     const body = req.body;
  //     const username = body.username;
  //     if (!username) {
  //       return res.status(400).json({ message: "Username is required" });
  //     }

  //     const toInt = (v) => {
  //       if (v == null || v === "") return null;
  //       const n = Number(v);
  //       return Number.isNaN(n) ? null : n;
  //     };

  //     console.log("~~~~~~~~~~~~~ Received profile update for username:", username, "with body:", body);
  //     // Validate required fields and types
  //     const name = (body.name ?? "").toString().trim();
  //     const role = (body.role ?? "").toString().trim();
  //     const age = toInt(body.age);
  //     const gender = (body.gender ?? "").toString().trim();
  //     const genre = (body.genre ?? "").toString().trim();
  //     const experience = toInt(body.experience);
  //     const mainImage = (body.profileImage ?? body.main_image ?? "")
  //       .toString()
  //       .trim();
  //     const lastSong = (body.favoriteSong ?? body.last_song ?? "")
  //       .toString()
  //       .trim();
  //     const lastSongDesc = (body.songDescription ?? body.last_song_desc ?? "")
  //       .toString()
  //       .trim();

  //     if (!name) return res.status(400).json({ message: "Name is required" });
  //     if (!role) return res.status(400).json({ message: "Role is required" });
  //     if (age == null || age < 1)
  //       return res
  //         .status(400)
  //         .json({ message: "Age is required and must be a positive integer" });
  //     if (!gender)
  //       return res.status(400).json({ message: "Gender is required" });
  //     if (!genre) return res.status(400).json({ message: "Genre is required" });
  //     if (experience == null || experience < 0)
  //       return res
  //         .status(400)
  //         .json({
  //           message:
  //             "Experience is required and must be a non-negative integer",
  //         });
  //     if (!mainImage)
  //       return res.status(400).json({ message: "Profile photo is required" });
  //     if (!lastSong)
  //       return res.status(400).json({ message: "Favorite song is required" });
  //     if (!lastSongDesc)
  //       return res
  //         .status(400)
  //         .json({ message: "Song description is required" });

  //     const updateData = {
  //       name,
  //       role,
  //       age,
  //       gender,
  //       genre,
  //       experience,
  //       main_image: mainImage,
  //       concert_image: body.concert_image ?? mainImage,
  //       last_song: lastSong,
  //       last_song_desc: lastSongDesc,
  //     };
  //     const updated = await db.Profile.updateUser(username, updateData);
  //     if (!updated) {
  //       return res.status(404).json({ message: "User not found" });
  //     }
  //     res.status(200).json(updated);
  //   } catch (err) {
  //     console.error("Error in POST /profile:", err);
  //     res.status(500).json({ message: "Failed to update profile" });
  //   }
  // });

  // Get all users
  app.get("/users", async (req, res) => {
    const users = await db.User.listUsers();
    res.json(users);
  });

  // Get user by ID
  app.get("/users/:username", async (req, res) => {
    const user = await db.User.getUserByUsername(req.params.username);
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  });

  // Update user (profile info) by username
  app.put("/users/:username", async (req, res) => {
    console.log(`++++++++++++++++ Received update for user ${req.params.username} with body:`, req.body);
    const updatedUser = await db.User.updateUser(req.params.username, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).send("User not found");
    }
  });

  // Delete user by ID
  app.delete("/users/:username", async (req, res) => {
    const success = await db.User.deleteUser(req.params.username);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("User not found");
    }
  });

  // Push image URL to database
  app.put("/users/:username/coverPhoto", async (req, res) => {
    try {
      const updatedUser = await db.Profile.updateCoverPhoto(
        req.params.username,
        req.body,
      );
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (err) {
      console.error("Error updating cover photo:", err);
      res.status(500).json({ error: "Failed to update cover photo" });
    }
  });

  // Get presigned URL for S3 upload
  app.put("/media/presign", presignUpload);
  app.put("/media/presign-view", presignView);

  //// INTERACTION ROUTES ////
  // Like another user
  app.post("/users/:username/like", async (req, res) => {
    try {
      const validation = await validateUserInteraction(req.params.username, req.body.targetUsername);
      if (validation.error) {
        return res.status(validation.status).json({ error: validation.message });
      }

      const result = await db.Interactions.likeUser(
        req.params.username,
        req.body.targetUsername,
      );
      res.json(result);
    } catch (err) {
      console.error("Error in like route:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dislike another user
  app.post("/users/:username/dislike", async (req, res) => {
    try {
      const validation = await validateUserInteraction(req.params.username, req.body.targetUsername);
      if (validation.error) {
        return res.status(validation.status).json({ error: validation.message });
      }

      const result = await db.Interactions.dislikeUser(
        req.params.username,
        req.body.targetUsername,
      );
      res.json(result);
    } catch (err) {
      console.error("Error in dislike route:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Block another user
  app.post("/users/:username/block", async (req, res) => {
    try {
      const validation = await validateUserInteraction(req.params.username, req.body.targetUsername);
      if (validation.error) {
        return res.status(validation.status).json({ error: validation.message });
      }

      const result = await db.Interactions.blockUser(
        req.params.username,
        req.body.targetUsername,
      );
      res.json(result);
    } catch (err) {
      console.error("Error in block route:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // List interactions for a user (used to filter already-swiped profiles)
  app.get("/users/:username/interactions", async (req, res) => {
    try {
      const username = req.params.username;
      const user = await db.Profile.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const interactions = await db.Interactions.listUserInteractions(username);
      res.json(interactions);
    } catch (err) {
      console.error("Error in list interactions route:", err);
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
    const updatedChat = await db.Messages.updateChat(
      req.params.chatId,
      req.body,
    );
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
    const participants = await db.Messages.listChatParticipants(
      req.params.chatId,
    );
    res.json(participants);
  });

  app.post("/chats/:chatId/participants", async (req, res) => {
    const result = await db.Messages.addChatParticipants(
      req.params.chatId,
      req.body,
    );
    res.json(result);
  });

  app.delete("/chats/:chatId/participants/:username", async (req, res) => {
    const success = await db.Messages.removeChatParticipant(
      req.params.chatId,
      req.params.username,
    );
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("Participant or chat not found");
    }
  });

  app.get("/chats/:chatId/messages", async (req, res) => {
    const messages = await db.Messages.listMessages(
      req.params.chatId,
      req.query,
    );
    res.json(messages);
  });

  app.get("/chats/:chatId/messages/:messageId", async (req, res) => {
    const message = await db.Messages.getMessage(
      req.params.chatId,
      req.params.messageId,
    );
    if (message) {
      res.json(message);
    } else {
      res.status(404).send("Message not found");
    }
  });

  app.post("/chats/:chatId/messages", async (req, res) => {
    console.log("++++++++++++++++++ message sent?", req.body);
    const newMessage = await db.Messages.sendMessage(
      req.params.chatId,
      req.body,
    );
    res.status(201).json(newMessage);
  });

  app.patch("/chats/:chatId/messages/:messageId", async (req, res) => {
    const updatedMessage = await db.Messages.updateMessage(
      req.params.chatId,
      req.params.messageId,
      req.body,
    );
    if (updatedMessage) {
      res.json(updatedMessage);
    } else {
      res.status(404).send("Message not found");
    }
  });

  app.delete("/chats/:chatId/messages/:messageId", async (req, res) => {
    const success = await db.Messages.deleteMessage(
      req.params.chatId,
      req.params.messageId,
    );
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

  //// NOTIFICATION ROUTES ////
  app.get("/notifications/:username", async (req, res) => {
    const notifications = await db.Notifications.listNotifications(
      req.params.username,
    );
    res.json(notifications);
  });

  app.get("/notifications/:username/unreadCount", async (req, res) => {
    const count = await db.Notifications.getUnreadNotificationsCount(
      req.params.username,
    );
    res.json({ unreadCount: count });
  });

  app.get("/notifications/id/:notificationId", async (req, res) => {
    const notification = await db.Notifications.getNotification(
      req.params.notificationId,
    );
    if (notification) res.json(notification);
    else res.status(404).send("Notification not found");
  });

  app.post("/notifications", async (req, res) => {
    const newNotification = await db.Notifications.createNotification(req.body);
    res.status(201).json(newNotification);
  });

  // Mark notification as read
  app.post("/notifications/:notificationId/read", async (req, res) => {
    const result = await db.Notifications.markNotificationRead(
      req.params.notificationId,
    );
    res.json(result);
  });

  // Mark notification as unread
  app.post("/notifications/:notificationId/unread", async (req, res) => {
    const result = await db.Notifications.markNotificationUnread(
      req.params.notificationId,
    );
    res.json(result);
  });

  // Mark all notifications as read
  app.post("/notifications/readAll", async (req, res) => {
    const result = await db.Notifications.markAllNotificationsRead(req.body);
    res.json(result);
  });

  // Archive notification
  app.post("/notifications/:notificationId/archive", async (req, res) => {
    const result = await db.Notifications.archiveNotification(
      req.params.notificationId,
    );
    res.json(result);
  });

  // Unarchive notification
  app.post("/notifications/:notificationId/unarchive", async (req, res) => {
    const result = await db.Notifications.unarchiveNotification(
      req.params.notificationId,
    );
    res.json(result);
  });

  // Delete notification
  app.delete("/notifications/id/:notificationId", async (req, res) => {
    const success = await db.Notifications.deleteNotification(
      req.params.notificationId,
    );
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).send("Notification not found");
    }
  });

  // Get notification preferences
  app.get("/notifications/preferences/:username", async (req, res) => {
    const preferences = await db.User.getNotificationPreferences(
      req.params.username,
    );
    res.json(preferences);
  });

  // Update notification preferences
  app.patch("/notifications/preferences/:username", async (req, res) => {
    const updatedPreferences = await db.User.updateNotificationPreferences(
      req.params.username,
      req.body,
    );
    res.json(updatedPreferences);
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
