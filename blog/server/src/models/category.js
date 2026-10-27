const pool = require('../config/db');

async function list() {
  const [rows] = await pool.query('SELECT id, name, description FROM categories ORDER BY id');
  return rows;
}

async function findByName(name) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE name = ?', [name]);
  return rows[0] || null;
}

module.exports = { list, findByName };
