require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./db');

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get('/', (req, res) => {
  res.json({ message: 'EduConnect API iko live 🚀' });
});

// TEST DB
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 + 1 AS result'); const rows = result.rows;
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER
app.listen(5000, "0.0.0.0", () => {
  console.log('🚀 EduConnect Server inafanya kazi: http://localhost:5000');
  console.log('📦 Mazingira: development');
});
