const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/productController');

const router = express.Router();
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.detail));

module.exports = router;
