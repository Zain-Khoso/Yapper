// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/chat.controller');

const router = Router();

// Routes.

// GET: Chat Page.
router.get('/', controller.getChatPage);

// GET: All Chatrooms of the current user.
router.get('/room/all', controller.getChatrooms);

// POST: Add Chatroom.
router.post('/room/add', controller.postAddChatroom);

module.exports = router;
