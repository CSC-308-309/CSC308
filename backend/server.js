import express from "express";
import { pool } from "./db/index.js";   
import Profile from "./models/Profile.js"; 
const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

//health check
app.get("/health", (req, res) => {
  res.send({ status: "Server is running" });
});

async function startServer() {
  try {
    ///test database connection
    await pool.query("SELECT NOW()");
    console.log("Connected to PostgreSQL");

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to PostgreSQL:", err);
    process.exit(1);
  }
}

startServer();

