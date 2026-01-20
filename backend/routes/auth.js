<<<<<<< HEAD
//backend/routes/auth.js
=======
// backend/routes/auth.js
>>>>>>> a809449 (Trying to update with messages)
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/User.js";

const router = express.Router();

<<<<<<< HEAD
//sign up
=======
// SIGN UP
>>>>>>> a809449 (Trying to update with messages)
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
<<<<<<< HEAD
    const username = email.split("@")[0];
    const user = await createUser(email, passwordHash, username);

    res.status(201).json({ message: "User created", username: user.username });
=======
    const user = await createUser(email, passwordHash);

    res.status(201).json({ message: "User created", userId: user.id });
>>>>>>> a809449 (Trying to update with messages)
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

<<<<<<< HEAD
//login
=======
// LOGIN
>>>>>>> a809449 (Trying to update with messages)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

<<<<<<< HEAD
    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.json({
      token,
      user: { email: user.email, username: user.username },
=======
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
>>>>>>> a809449 (Trying to update with messages)
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
