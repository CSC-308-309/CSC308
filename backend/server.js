import pool from "./db/index.js";
import { createApp } from "./app.js";
import { dbModels } from "./models/index.js";
import authRoutes from "./routes/auth.js";


import dotenv from 'dotenv';
dotenv.config()

const port = process.env.PORT || 8000;

async function startServer() {
  try {
    ///test database connection
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL");

    const app = createApp({ db: dbModels });

    app.use("/auth", authRoutes);

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }
}

startServer();
