const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fail = require('../utils/fail');
const userModel = require('../models/user');

function assertRegister(body) {
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  if (username.length < 3 || username.length > 20) fail(400, '用户名需要 3-20 个字符');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, '邮箱格式不正确');
  if (password.length < 6) fail(400, '密码至少 6 位');
  return { username, email, password };
}

async function register(req, res) {
  const { username, email, password } = assertRegister(req.body || {});
  const existing = await userModel.findByUsernameOrEmail(username, email);
  if (existing) fail(409, '用户名或邮箱已存在');
  const hash = await bcrypt.hash(password, 10);
  const id = await userModel.create({ username, email, password: hash, avatar: '' });
  res.status(201).json({
    message: '注册成功',
    user: { id, username, email, avatar: '' },
  });
}

async function login(req, res) {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  if (!username || !password) fail(400, '请输入用户名和密码');
  const user = await userModel.findByUsername(username);
  if (!user) fail(401, '用户名或密码错误');
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) fail(401, '用户名或密码错误');
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: userModel.publicUser(user) });
}

module.exports = { register, login };
