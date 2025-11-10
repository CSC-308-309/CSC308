const express = require('express');
const cors = require('cors');
const {pool} = require('./models');
const Profile = require('./models/Profile');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/profiles', async (req, res) => {
  try {
    const profiles = await Profile.findAll();
    res.json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database(), current_user, version()');
    res.json({
      connected: true,
      database: result.rows[0]
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

app.post('/profiles', async (req, res) => {
  try {
    console.log(req.body);
    const newProfile = await Profile.create(req.body);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
