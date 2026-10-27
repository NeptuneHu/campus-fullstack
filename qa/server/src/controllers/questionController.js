const pool = require('../config/db');
const fail = require('../utils/fail');
const { normalizeTags } = require('../utils/tags');
const { withTransaction } = require('../utils/tx');
const questionModel = require('../models/question');

function paging(query) {
  return {
    page: Math.max(1, Number(query.page) || 1),
    pageSize: Math.min(50, Math.max(1, Number(query.pageSize) || 10)),
    sort: ['latest', 'hot', 'unsolved'].includes(query.sort) ? query.sort : 'latest',
    tag: String(query.tag || '').trim(),
  };
}

function assertTitle(title) {
  const value = String(title || '').trim();
  if (!value || value.length > 120) fail(400, '标题需要 1-120 个字符');
  return value;
}

function assertContent(content) {
  const value = String(content || '').trim();
  if (!value) fail(400, '请填写内容');
  if (value.length > 20000) fail(400, '内容过长');
  return value;
}

async function list(req, res) {
  const query = paging(req.query);
  const result = await questionModel.list({ ...query, userId: Number(req.user?.id || 0) });
  res.json(result);
}

async function detail(req, res) {
  const id = Number(req.params.id);
  const userId = Number(req.user?.id || 0);
  const question = await questionModel.findById(id, userId);
  if (!question) fail(404, '问题不存在');
  await questionModel.addView(id);
  question.views += 1;
  const answers = await questionModel.answersOf(id, userId);
  res.json({ question, answers });
}

async function create(req, res) {
  const title = assertTitle(req.body?.title);
  const content = assertContent(req.body?.content);
  const tags = normalizeTags(req.body?.tags);
  const userId = Number(req.user.id);
  const id = await withTransaction(async (conn) => {
    const [users] = await conn.query('SELECT points FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!users[0]) fail(404, '用户不存在');
    if (Number(users[0].points) < 5) fail(400, '声望不足，发布问题需要 5 点声望');
    const [result] = await conn.query(
      `INSERT INTO questions (title, content, tags, author_id) VALUES (?, ?, ?, ?)`,
      [title, content, JSON.stringify(tags), userId]
    );
    await conn.query('UPDATE users SET points = points - 5 WHERE id = ?', [userId]);
    return result.insertId;
  });
  const question = await questionModel.findById(id, userId);
  res.status(201).json({ question });
}

async function answer(req, res) {
  const questionId = Number(req.params.id);
  const content = assertContent(req.body?.content);
  const userId = Number(req.user.id);
  const answerId = await withTransaction(async (conn) => {
    const [questions] = await conn.query('SELECT * FROM questions WHERE id = ? FOR UPDATE', [questionId]);
    if (!questions[0]) fail(404, '问题不存在');
    if (Number(questions[0].author_id) === userId) fail(400, '不能回答自己的问题');
    const [result] = await conn.query(
      'INSERT INTO answers (content, question_id, author_id) VALUES (?, ?, ?)',
      [content, questionId, userId]
    );
    await conn.query('UPDATE questions SET answers_count = answers_count + 1 WHERE id = ?', [questionId]);
    await conn.query('UPDATE users SET points = points + 10 WHERE id = ?', [userId]);
    return result.insertId;
  });
  res.status(201).json({ id: answerId, message: '回答已发布，声望 +10' });
}

async function voteQuestion(req, res) {
  const questionId = Number(req.params.id);
  const userId = Number(req.user.id);
  const voted = await withTransaction(async (conn) => {
    const [questions] = await conn.query('SELECT * FROM questions WHERE id = ? FOR UPDATE', [questionId]);
    if (!questions[0]) fail(404, '问题不存在');
    const [existing] = await conn.query(
      `SELECT id FROM votes WHERE user_id = ? AND target_type = 'question' AND target_id = ? FOR UPDATE`,
      [userId, questionId]
    );
    if (existing.length) {
      await conn.query('DELETE FROM votes WHERE id = ?', [existing[0].id]);
      await conn.query('UPDATE questions SET votes = GREATEST(votes - 1, 0) WHERE id = ?', [questionId]);
      await conn.query('UPDATE users SET points = points - 5 WHERE id = ?', [questions[0].author_id]);
      return false;
    }
    await conn.query(
      `INSERT INTO votes (user_id, target_type, target_id) VALUES (?, 'question', ?)`,
      [userId, questionId]
    );
    await conn.query('UPDATE questions SET votes = votes + 1 WHERE id = ?', [questionId]);
    await conn.query('UPDATE users SET points = points + 5 WHERE id = ?', [questions[0].author_id]);
    return true;
  });
  const question = await questionModel.findById(questionId, userId);
  res.json({ voted, votes: question.votes });
}

module.exports = { list, detail, create, answer, voteQuestion };
