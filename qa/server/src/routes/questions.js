const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth, optionalAuth } = require('../middleware/auth');
const controller = require('../controllers/questionController');

const router = express.Router();
router.get('/', optionalAuth, asyncHandler(controller.list));
router.get('/:id', optionalAuth, asyncHandler(controller.detail));
router.post('/', auth, asyncHandler(controller.create));
router.post('/:id/answers', auth, asyncHandler(controller.answer));
router.post('/:id/vote', auth, asyncHandler(controller.voteQuestion));

module.exports = router;
