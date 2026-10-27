const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { auth } = require('../middleware/auth');
const controller = require('../controllers/addressController');

const router = express.Router();
router.use(auth);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
