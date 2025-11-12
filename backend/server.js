<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
const { connectToDatabase, pool } = require('./db/index.js');
const Profile = require('./models/Profile');
const port = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

app.post('/api/profiles', async (req, res) => {
  try {
    const newProfile = await Profile.create(req.body);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile', details: error.message });
  }
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database(), current_user, version()');
    res.json({ connected: true, database: result.rows[0] });
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log('Server running on http://localhost:' + port);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
=======
// backend/server.js
console.log("Backend running");

import { createApp } from "./app.js";

const port = process.env.PORT || 8000;
const dbType = process.env.DB || "testDatabase";

let db;

if (dbType === "testDatabase") {
  const { connectToTestDatabase } = await import("./db/testDatabase.js");
  db = await connectToTestDatabase();
} else if (dbType === "productionDatabase") {
  throw new Error("Production database not implemented yet");
} else {
  throw new Error(`Unknown database type: ${dbType}`);
}

const app = createApp({ db });

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port} (DB=${dbType})`);
});

// Optional: graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
});
>>>>>>> dcc4ba1d2ebfb29b64c04461006151db8adefc9a
