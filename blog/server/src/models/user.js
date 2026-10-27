const pool = require('../config/db');

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
    created_at: user.created_at,
  };
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findByUsernameOrEmail(username, email) {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
    [username, email]
  );
  return rows[0] || null;
}

async function create({ username, email, password, avatar }) {
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)',
    [username, email, password, avatar || '']
  );
  return result.insertId;
}

async function update(id, fields) {
  const sets = [];
  const params = [];
  if (fields.email !== undefined) {
    sets.push('email = ?');
    params.push(fields.email);
  }
  if (fields.avatar !== undefined) {
    sets.push('avatar = ?');
    params.push(fields.avatar);
  }
  if (!sets.length) return;
  params.push(id);
  await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
}

module.exports = {
  publicUser,
  findById,
  findByUsername,
  findByEmail,
  findByUsernameOrEmail,
  create,
  update,
};
