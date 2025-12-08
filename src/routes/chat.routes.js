// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/chat.controller');

const router = Router();

// Routes.

// GET: Chat Page.
router.get('/', controller.getChatPage);

// POST: Add Chatroom.
router.post('/room/add', controller.postAddChatroom);

module.exports = router;
