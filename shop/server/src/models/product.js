const pool = require('../config/db');

function readImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatProduct(row) {
  if (!row) return null;
  return {
    ...row,
    price: Number(row.price),
    stock: Number(row.stock),
    images: readImages(row.images),
  };
}

async function list(category) {
  const params = [];
  let where = '';
  if (category) {
    where = 'WHERE category = ?';
    params.push(category);
  }
  const [rows] = await pool.query(
    `SELECT * FROM products ${where} ORDER BY id`,
    params
  );
  return rows.map(formatProduct);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return formatProduct(rows[0]);
}

module.exports = { list, findById, formatProduct };
