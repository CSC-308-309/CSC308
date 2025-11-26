const express = require('express');
const { pool } = require('./db/index');
const Profile = require('./models/Profile');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

//health check
app.get('/health', (req, res) => {
  res.send({ status: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.send({ message: 'Welcome to the API!' });
});

async function startServer() {
  try {
    ///test database connection
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL');

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err);
    process.exit(1);
  }
}

startServer();
