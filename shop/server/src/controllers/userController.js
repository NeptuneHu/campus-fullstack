const fail = require('../utils/fail');
const userModel = require('../models/user');

async function me(req, res) {
  const user = await userModel.findById(req.user.id);
  if (!user) fail(404, '用户不存在');
  res.json({ user: userModel.publicUser(user) });
}

async function updateMe(req, res) {
  const fields = {};
  if (req.body?.avatar !== undefined) {
    fields.avatar = String(req.body.avatar || '').trim();
    if (fields.avatar.length > 255) fail(400, '头像地址过长');
  }
  if (req.body?.email !== undefined) {
    fields.email = String(req.body.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) fail(400, '邮箱格式不正确');
    const existing = await userModel.findByEmail(fields.email);
    if (existing && Number(existing.id) !== Number(req.user.id)) fail(409, '邮箱已被使用');
  }
  await userModel.update(req.user.id, fields);
  const user = await userModel.findById(req.user.id);
  res.json({ user: userModel.publicUser(user) });
}

module.exports = { me, updateMe };
