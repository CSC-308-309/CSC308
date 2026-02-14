import "dotenv/config";

import pool from "./db/index.js";
import { createApp } from "./app.js";
import { dbModels } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 8000;

async function startServer() {
  try {
    ///test database connection
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL");

    const app = createApp({ db: dbModels });

    app.use("/auth", authRoutes);

    //added for CD
    app.listen(process.env.PORT || port, () => {
      console.log("REST API is listening.");
    });
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }
}

startServer();
