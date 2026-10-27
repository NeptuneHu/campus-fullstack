const pool = require('../config/db');

function money(value) {
  return Math.round(Number(value) * 100) / 100;
}

function formatItem(row) {
  const price = money(row.price);
  const quantity = Number(row.quantity);
  return {
    id: row.id,
    product_id: row.product_id,
    name: row.name,
    category: row.category,
    price,
    stock: Number(row.stock),
    quantity,
    line_total: money(price * quantity),
  };
}

async function listByUser(userId) {
  const [rows] = await pool.query(
    `SELECT c.id, c.product_id, c.quantity, p.name, p.category, p.price, p.stock
     FROM cart_items c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = ?
     ORDER BY c.id`,
    [userId]
  );
  const items = rows.map(formatItem);
  const total = money(items.reduce((sum, item) => sum + item.line_total, 0));
  return { items, total_price: total };
}

module.exports = { listByUser, money };
