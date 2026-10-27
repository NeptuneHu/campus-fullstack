const pool = require('../config/db');
const fail = require('../utils/fail');

function readAddress(body) {
  const address = {
    name: String(body?.name || '').trim(),
    phone: String(body?.phone || '').trim(),
    province: String(body?.province || '').trim(),
    city: String(body?.city || '').trim(),
    district: String(body?.district || '').trim(),
    detail: String(body?.detail || '').trim(),
    is_default: body?.is_default ? 1 : 0,
  };
  if (!address.name || !address.province || !address.city || !address.district || !address.detail) {
    fail(400, '请把收货信息填完整');
  }
  if (!/^\d{6,20}$/.test(address.phone)) fail(400, '电话请填写 6-20 位数字');
  return address;
}

async function list(req, res) {
  const [rows] = await pool.query(
    'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id',
    [req.user.id]
  );
  res.json({ addresses: rows });
}

async function create(req, res) {
  const address = readAddress(req.body);
  const userId = Number(req.user.id);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM addresses WHERE user_id = ?', [userId]);
    const makeDefault = Number(countRows[0].total) === 0 ? 1 : address.is_default;
    if (makeDefault) {
      await conn.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    const [result] = await conn.query(
      `INSERT INTO addresses (user_id, name, phone, province, city, district, detail, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, address.name, address.phone, address.province, address.city, address.district, address.detail, makeDefault]
    );
    await conn.commit();
    const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    res.status(201).json({ address: rows[0] });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function update(req, res) {
  const address = readAddress(req.body);
  const id = Number(req.params.id);
  const userId = Number(req.user.id);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT id FROM addresses WHERE id = ? AND user_id = ? FOR UPDATE', [id, userId]);
    if (!rows[0]) fail(404, '地址不存在');
    if (address.is_default) {
      await conn.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    await conn.query(
      `UPDATE addresses
       SET name = ?, phone = ?, province = ?, city = ?, district = ?, detail = ?, is_default = ?
       WHERE id = ?`,
      [address.name, address.phone, address.province, address.city, address.district, address.detail, address.is_default, id]
    );
    await conn.commit();
    const [updated] = await pool.query('SELECT * FROM addresses WHERE id = ?', [id]);
    res.json({ address: updated[0] });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function remove(req, res) {
  const id = Number(req.params.id);
  const userId = Number(req.user.id);
  const [rows] = await pool.query('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
  if (!rows[0]) fail(404, '地址不存在');
  const [used] = await pool.query('SELECT id FROM orders WHERE address_id = ? LIMIT 1', [id]);
  if (used.length) fail(400, '这个地址已经用在订单里，不能删除');
  await pool.query('DELETE FROM addresses WHERE id = ?', [id]);
  if (rows[0].is_default) {
    await pool.query(
      'UPDATE addresses SET is_default = 1 WHERE user_id = ? ORDER BY id LIMIT 1',
      [userId]
    );
  }
  res.json({ message: '地址已删除' });
}

module.exports = { list, create, update, remove };
