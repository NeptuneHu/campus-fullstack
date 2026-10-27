const fail = require('../utils/fail');
const productModel = require('../models/product');

async function list(req, res) {
  const category = String(req.query.category || '').trim();
  const products = await productModel.list(category);
  res.json({ products });
}

async function detail(req, res) {
  const product = await productModel.findById(Number(req.params.id));
  if (!product) fail(404, '商品不存在');
  res.json({ product });
}

module.exports = { list, detail };
