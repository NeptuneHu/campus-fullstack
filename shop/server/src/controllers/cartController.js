const fail = require('../utils/fail');
const { withTransaction } = require('../utils/tx');
const cartModel = require('../models/cart');

function parseQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1) fail(400, '数量必须是正整数');
  return quantity;
}

async function list(req, res) {
  res.json(await cartModel.listByUser(req.user.id));
}

async function add(req, res) {
  const productId = Number(req.body?.product_id);
  const quantity = parseQuantity(req.body?.quantity || 1);
  const userId = Number(req.user.id);
  await withTransaction(async (conn) => {
    const [products] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
    if (!products[0]) fail(404, '商品不存在');
    const [existing] = await conn.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? FOR UPDATE',
      [userId, productId]
    );
    const current = existing[0] ? Number(existing[0].quantity) : 0;
    const next = current + quantity;
    if (next > Number(products[0].stock)) fail(400, `库存不足，当前库存 ${products[0].stock}`);
    if (existing[0]) {
      await conn.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [next, existing[0].id]);
    } else {
      await conn.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, next]
      );
    }
  });
  res.status(201).json({ message: '已加入购物车' });
}

async function update(req, res) {
  const id = Number(req.params.id);
  const quantity = parseQuantity(req.body?.quantity);
  const userId = Number(req.user.id);
  await withTransaction(async (conn) => {
    const [items] = await conn.query(
      `SELECT c.*, p.stock, p.name FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.id = ? AND c.user_id = ? FOR UPDATE`,
      [id, userId]
    );
    if (!items[0]) fail(404, '购物车里没有这件商品');
    if (quantity > Number(items[0].stock)) fail(400, `${items[0].name} 库存不足，当前库存 ${items[0].stock}`);
    await conn.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id]);
  });
  res.json(await cartModel.listByUser(userId));
}

async function remove(req, res) {
  const [result] = await require('../config/db').query(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [Number(req.params.id), req.user.id]
  );
  if (!result.affectedRows) fail(404, '购物车里没有这件商品');
  res.json({ message: '已移出购物车' });
}

module.exports = { list, add, update, remove };
