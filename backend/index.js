// backend/index.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

import { connectToDatabase } from "./db/index.js";
import authRoutes from "./routes/auth.js";

dotenv.config({ path: path.resolve("../.env") });

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for frontend
app.use(cors({ origin: "http://localhost:5173" }));

// JSON parsing
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Health check
app.get("/", (req, res) => res.send("Backend running"));

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

startServer();

