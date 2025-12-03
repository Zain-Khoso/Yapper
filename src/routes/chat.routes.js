// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/chat.controller');

const router = Router();

// Routes.

// GET: Chat Page.
router.get('/chat', controller.getChatPage);

module.exports = router;
