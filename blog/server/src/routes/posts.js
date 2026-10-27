const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, optionalAuth } = require('../middleware/auth');
const controller = require('../controllers/postController');

const router = express.Router();
router.get('/', asyncHandler(controller.list));
router.get('/:id', optionalAuth, asyncHandler(controller.detail));
router.post('/', auth, asyncHandler(controller.create));
router.put('/:id', auth, asyncHandler(controller.update));
router.delete('/:id', auth, asyncHandler(controller.remove));

module.exports = router;
