const categoryModel = require('../models/category');

async function list(req, res) {
  const categories = await categoryModel.list();
  res.json({ categories });
}

module.exports = { list };
