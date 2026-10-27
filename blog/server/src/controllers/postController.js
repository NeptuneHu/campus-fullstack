const fail = require('../utils/fail');
const { normalizeTags } = require('../utils/tags');
const postModel = require('../models/post');
const categoryModel = require('../models/category');

function pageQuery(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 10));
  const category = String(query.category || '').trim();
  const keyword = String(query.keyword || '').trim();
  return { page, pageSize, category, keyword };
}

async function ensureCategory(name) {
  const category = await categoryModel.findByName(name);
  if (!category) fail(400, '请选择已有分类');
  return category.name;
}

function assertTitle(title) {
  const value = String(title || '').trim();
  if (!value || value.length > 80) fail(400, '标题需要 1-80 个字符');
  return value;
}

function assertContent(content) {
  const value = String(content || '').trim();
  if (!value) fail(400, '请填写正文');
  if (value.length > 20000) fail(400, '正文过长');
  return value;
}

async function list(req, res) {
  const result = await postModel.list(pageQuery(req.query));
  res.json(result);
}

async function detail(req, res) {
  const id = Number(req.params.id);
  const post = await postModel.findById(id);
  if (!post) fail(404, '文章不存在');
  const isOwner = req.user && Number(req.user.id) === Number(post.author_id);
  if (!(req.query.preview === '1' && isOwner)) {
    await postModel.addView(id);
    post.views += 1;
  }
  res.json({ post });
}

async function create(req, res) {
  const title = assertTitle(req.body?.title);
  const content = assertContent(req.body?.content);
  const category = await ensureCategory(String(req.body?.category || '').trim());
  const cover = String(req.body?.cover || '').trim();
  if (cover.length > 255) fail(400, '封面地址过长');
  const tags = normalizeTags(req.body?.tags);
  const post = await postModel.create({
    title,
    content,
    cover,
    category,
    tags,
    author_id: Number(req.user.id),
  });
  res.status(201).json({ post });
}

async function update(req, res) {
  const id = Number(req.params.id);
  const current = await postModel.findById(id);
  if (!current) fail(404, '文章不存在');
  if (Number(current.author_id) !== Number(req.user.id)) fail(403, '只能修改自己的文章');
  const fields = {};
  if (req.body?.title !== undefined) fields.title = assertTitle(req.body.title);
  if (req.body?.content !== undefined) fields.content = assertContent(req.body.content);
  if (req.body?.category !== undefined) fields.category = await ensureCategory(String(req.body.category).trim());
  if (req.body?.cover !== undefined) {
    fields.cover = String(req.body.cover || '').trim();
    if (fields.cover.length > 255) fail(400, '封面地址过长');
  }
  if (req.body?.tags !== undefined) fields.tags = normalizeTags(req.body.tags);
  const post = await postModel.update(id, fields);
  res.json({ post });
}

async function remove(req, res) {
  const id = Number(req.params.id);
  const current = await postModel.findById(id);
  if (!current) fail(404, '文章不存在');
  if (Number(current.author_id) !== Number(req.user.id)) fail(403, '只能删除自己的文章');
  await postModel.remove(id);
  res.json({ message: '已删除' });
}

module.exports = { list, detail, create, update, remove };
