const pool = require('../config/db');
const { readTags } = require('../utils/tags');

function formatQuestion(row) {
  if (!row) return null;
  return {
    ...row,
    tags: readTags(row.tags),
    views: Number(row.views || 0),
    votes: Number(row.votes || 0),
    answers_count: Number(row.answers_count || 0),
    is_solved: Boolean(row.is_solved),
    voted: Boolean(row.voted),
    author_id: Number(row.author_id),
    author_points: row.author_points === undefined ? undefined : Number(row.author_points),
  };
}

function formatAnswer(row) {
  return {
    ...row,
    votes: Number(row.votes || 0),
    is_accepted: Boolean(row.is_accepted),
    voted: Boolean(row.voted),
    author_id: Number(row.author_id),
    question_id: Number(row.question_id),
    author_points: Number(row.author_points || 0),
  };
}

async function list({ page, pageSize, sort, tag, userId }) {
  const where = [];
  const params = [];
  if (tag) {
    where.push('JSON_CONTAINS(q.tags, JSON_QUOTE(?))');
    params.push(tag);
  }
  if (sort === 'unsolved') where.push('q.is_solved = 0');
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order = sort === 'hot' ? 'q.votes DESC, q.created_at DESC' : 'q.created_at DESC';
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM questions q ${clause}`, params);
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT q.*, u.username AS author_name, u.avatar AS author_avatar, u.points AS author_points,
      EXISTS(
        SELECT 1 FROM votes v
        WHERE v.user_id = ? AND v.target_type = 'question' AND v.target_id = q.id
      ) AS voted
     FROM questions q
     JOIN users u ON u.id = q.author_id
     ${clause}
     ORDER BY ${order}
     LIMIT ? OFFSET ?`,
    [userId || 0, ...params, pageSize, offset]
  );
  return { questions: rows.map(formatQuestion), total: Number(countRows[0].total) };
}

async function findById(id, userId = 0) {
  const [rows] = await pool.query(
    `SELECT q.*, u.username AS author_name, u.avatar AS author_avatar, u.points AS author_points,
      EXISTS(
        SELECT 1 FROM votes v
        WHERE v.user_id = ? AND v.target_type = 'question' AND v.target_id = q.id
      ) AS voted
     FROM questions q
     JOIN users u ON u.id = q.author_id
     WHERE q.id = ?`,
    [userId || 0, id]
  );
  return formatQuestion(rows[0]);
}

async function answersOf(questionId, userId = 0) {
  const [rows] = await pool.query(
    `SELECT a.*, u.username AS author_name, u.avatar AS author_avatar, u.points AS author_points,
      EXISTS(
        SELECT 1 FROM votes v
        WHERE v.user_id = ? AND v.target_type = 'answer' AND v.target_id = a.id
      ) AS voted
     FROM answers a
     JOIN users u ON u.id = a.author_id
     WHERE a.question_id = ?
     ORDER BY a.is_accepted DESC, a.votes DESC, a.created_at ASC`,
    [userId || 0, questionId]
  );
  return rows.map(formatAnswer);
}

async function listByAuthor(authorId) {
  const [rows] = await pool.query(
    `SELECT q.*, u.username AS author_name, u.points AS author_points, 0 AS voted
     FROM questions q JOIN users u ON u.id = q.author_id
     WHERE q.author_id = ?
     ORDER BY q.created_at DESC`,
    [authorId]
  );
  return rows.map(formatQuestion);
}

async function addView(id) {
  await pool.query('UPDATE questions SET views = views + 1 WHERE id = ?', [id]);
}

module.exports = { list, findById, answersOf, listByAuthor, addView };
