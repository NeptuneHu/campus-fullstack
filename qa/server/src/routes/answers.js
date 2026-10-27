const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth } = require('../middleware/auth');
const controller = require('../controllers/answerController');

const router = express.Router();
router.post('/:id/vote', auth, asyncHandler(controller.vote));
router.post('/:id/accept', auth, asyncHandler(controller.accept));

module.exports = router;
