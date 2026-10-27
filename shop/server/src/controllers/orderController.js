const pool = require('../config/db');
const fail = require('../utils/fail');
const { withTransaction } = require('../utils/tx');
const { money } = require('../models/cart');

const STATUSES = ['待支付', '已支付', '已发货', '已完成', '已取消'];

function orderNo() {
  return `${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
}

async function itemsOf(orderIds) {
  if (!orderIds.length) return [];
  const [rows] = await pool.query(
    `SELECT oi.*, p.name, p.category
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id IN (?)`,
    [orderIds]
  );
  return rows.map((row) => ({
    ...row,
    price: money(row.price),
    quantity: Number(row.quantity),
  }));
}

function attach(orders, items) {
  return orders.map((order) => ({
    ...order,
    total_price: money(order.total_price),
    items: items.filter((item) => item.order_id === order.id),
  }));
}

async function loadOne(id, userId) {
  const [orders] = await pool.query(
    `SELECT o.*, a.name AS receiver, a.phone, a.province, a.city, a.district, a.detail
     FROM orders o
     JOIN addresses a ON a.id = o.address_id
     WHERE o.id = ? AND o.user_id = ?`,
    [id, userId]
  );
  if (!orders[0]) return null;
  const items = await itemsOf([orders[0].id]);
  return attach(orders, items)[0];
}

async function list(req, res) {
  const status = String(req.query.status || '').trim();
  if (status && !STATUSES.includes(status)) fail(400, '没有这个订单状态');
  const params = [req.user.id];
  let where = 'WHERE user_id = ?';
  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  const [orders] = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
    params
  );
  const items = await itemsOf(orders.map((order) => order.id));
  res.json({ orders: attach(orders, items) });
}

async function detail(req, res) {
  const order = await loadOne(Number(req.params.id), req.user.id);
  if (!order) fail(404, '订单不存在');
  res.json({ order });
}

async function create(req, res) {
  const addressId = Number(req.body?.address_id);
  const ids = [...new Set((req.body?.cart_item_ids || []).map(Number))].filter((id) => Number.isInteger(id) && id > 0);
  if (!addressId) fail(400, '请选择收货地址');
  if (!ids.length) fail(400, '请选择要结算的商品');
  const userId = Number(req.user.id);

  const orderId = await withTransaction(async (conn) => {
    const [addresses] = await conn.query(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );
    if (!addresses[0]) fail(400, '请选择自己的收货地址');
    const [cartItems] = await conn.query(
      `SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.name, p.price, p.stock
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ? AND c.id IN (?)
       FOR UPDATE`,
      [userId, ids]
    );
    if (cartItems.length !== ids.length) fail(400, '有商品不在购物车里');
    let total = 0;
    for (const item of cartItems) {
      if (Number(item.quantity) > Number(item.stock)) fail(400, `${item.name} 库存不足`);
      if (Number(item.quantity) < 1) fail(400, '商品数量不正确');
      total += money(item.price) * Number(item.quantity);
    }
    total = money(total);
    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_no, user_id, address_id, total_price, status)
       VALUES (?, ?, ?, ?, '待支付')`,
      [orderNo(), userId, addressId, total]
    );
    for (const item of cartItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.product_id, item.quantity, item.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [
        item.quantity,
        item.product_id,
        item.quantity,
      ]);
    }
    await conn.query('DELETE FROM cart_items WHERE user_id = ? AND id IN (?)', [userId, ids]);
    return orderResult.insertId;
  });

  res.status(201).json({ order: await loadOne(orderId, userId) });
}

async function cancel(req, res) {
  const id = Number(req.params.id);
  const userId = Number(req.user.id);
  await withTransaction(async (conn) => {
    const [orders] = await conn.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? FOR UPDATE',
      [id, userId]
    );
    if (!orders[0]) fail(404, '订单不存在');
    if (orders[0].status !== '待支付') fail(400, '只能取消待支付的订单');
    const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    for (const item of items) {
      await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
    }
    await conn.query(`UPDATE orders SET status = '已取消' WHERE id = ?`, [id]);
  });
  res.json({ order: await loadOne(id, userId) });
}

module.exports = { list, detail, create, cancel };
