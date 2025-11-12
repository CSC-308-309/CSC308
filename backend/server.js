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