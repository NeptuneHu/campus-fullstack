const pool = require('../config/db');
const fail = require('../utils/fail');
const { withTransaction } = require('../utils/tx');

async function vote(req, res) {
  const answerId = Number(req.params.id);
  const userId = Number(req.user.id);
  const voted = await withTransaction(async (conn) => {
    const [answers] = await conn.query('SELECT * FROM answers WHERE id = ? FOR UPDATE', [answerId]);
    if (!answers[0]) fail(404, '回答不存在');
    const [existing] = await conn.query(
      `SELECT id FROM votes WHERE user_id = ? AND target_type = 'answer' AND target_id = ? FOR UPDATE`,
      [userId, answerId]
    );
    if (existing.length) {
      await conn.query('DELETE FROM votes WHERE id = ?', [existing[0].id]);
      await conn.query('UPDATE answers SET votes = GREATEST(votes - 1, 0) WHERE id = ?', [answerId]);
      await conn.query('UPDATE users SET points = points - 10 WHERE id = ?', [answers[0].author_id]);
      return false;
    }
    await conn.query(
      `INSERT INTO votes (user_id, target_type, target_id) VALUES (?, 'answer', ?)`,
      [userId, answerId]
    );
    await conn.query('UPDATE answers SET votes = votes + 1 WHERE id = ?', [answerId]);
    await conn.query('UPDATE users SET points = points + 10 WHERE id = ?', [answers[0].author_id]);
    return true;
  });
  const [rows] = await pool.query('SELECT votes FROM answers WHERE id = ?', [answerId]);
  res.json({ voted, votes: Number(rows[0].votes) });
}

async function accept(req, res) {
  const answerId = Number(req.params.id);
  const userId = Number(req.user.id);
  await withTransaction(async (conn) => {
    const [answers] = await conn.query('SELECT * FROM answers WHERE id = ? FOR UPDATE', [answerId]);
    if (!answers[0]) fail(404, '回答不存在');
    const [questions] = await conn.query('SELECT * FROM questions WHERE id = ? FOR UPDATE', [answers[0].question_id]);
    if (Number(questions[0].author_id) !== userId) fail(403, '只有提问者可以采纳');
    if (questions[0].is_solved) fail(400, '这个问题已经采纳过答案');
    await conn.query('UPDATE answers SET is_accepted = 1 WHERE id = ?', [answerId]);
    await conn.query('UPDATE questions SET is_solved = 1 WHERE id = ?', [questions[0].id]);
    await conn.query('UPDATE users SET points = points + 30 WHERE id = ?', [answers[0].author_id]);
  });
  res.json({ message: '已采纳，回答者声望 +30' });
}

module.exports = { vote, accept };
