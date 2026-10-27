const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth } = require('../middleware/auth');
const controller = require('../controllers/orderController');

const router = express.Router();
router.use(auth);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.detail));
router.put('/:id/cancel', asyncHandler(controller.cancel));

module.exports = router;
