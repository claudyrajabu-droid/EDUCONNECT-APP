require('dotenv').config();
const pool = require('./db');
const fs = require('fs');

async function run() {
  const sql = fs.readFileSync('./schema.sql', 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Schema imeundwa kikamilifu!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}
run();
