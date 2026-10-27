const pool = require('../config/db');
const { readTags } = require('../utils/tags');

function format(row) {
  if (!row) return null;
  return {
    ...row,
    tags: readTags(row.tags),
    views: Number(row.views || 0),
    author_id: Number(row.author_id),
  };
}

const SELECT = `
  SELECT p.*, u.username AS author_name, u.avatar AS author_avatar
  FROM posts p
  JOIN users u ON u.id = p.author_id
`;

async function findById(id) {
  const [rows] = await pool.query(`${SELECT} WHERE p.id = ?`, [id]);
  return format(rows[0]);
}

async function addView(id) {
  await pool.query('UPDATE posts SET views = views + 1 WHERE id = ?', [id]);
}

async function list({ page, pageSize, category, keyword }) {
  const where = [];
  const params = [];
  if (category) {
    where.push('p.category = ?');
    params.push(category);
  }
  if (keyword) {
    where.push('(p.title LIKE ? OR p.content LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM posts p ${clause}`, params);
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `${SELECT} ${clause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  return { posts: rows.map(format), total: Number(countRows[0].total) };
}

async function listByAuthor(authorId) {
  const [rows] = await pool.query(
    `${SELECT} WHERE p.author_id = ? ORDER BY p.created_at DESC LIMIT 50`,
    [authorId]
  );
  return rows.map(format);
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO posts (title, content, cover, category, tags, author_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.title, data.content, data.cover || '', data.category, JSON.stringify(data.tags), data.author_id]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const sets = [];
  const params = [];
  for (const key of ['title', 'content', 'cover', 'category']) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }
  if (fields.tags !== undefined) {
    sets.push('tags = ?');
    params.push(JSON.stringify(fields.tags));
  }
  if (!sets.length) return findById(id);
  params.push(id);
  await pool.query(`UPDATE posts SET ${sets.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM posts WHERE id = ?', [id]);
}

module.exports = { findById, addView, list, listByAuthor, create, update, remove };
