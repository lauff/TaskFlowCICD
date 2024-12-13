// version-demo-01

const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'tasks',
  password: 'password',
  port: 5432,
});

// Endpoint to fetch tasks
app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks');
  res.json(result.rows);
});

// Endpoint to create a task
app.post('/tasks', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query('INSERT INTO tasks (name) VALUES ($1) RETURNING *', [name]);
  res.json(result.rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
