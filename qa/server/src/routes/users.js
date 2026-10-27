const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth } = require('../middleware/auth');
const controller = require('../controllers/userController');

const router = express.Router();
router.get('/me', auth, asyncHandler(controller.me));
router.put('/me', auth, asyncHandler(controller.updateMe));
router.get('/me/questions', auth, asyncHandler(controller.myQuestions));

module.exports = router;
