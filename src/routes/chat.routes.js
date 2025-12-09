// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/chat.controller');

const router = Router();

// Routes.

// GET: Chat Page.
router.get('/', controller.getChatPage);

// PUT: Delete All Messages for this user.
router.put('/delete', controller.putDeleteChat);

// GET: All Chatrooms of the current user.
router.get('/room/all', controller.getChatrooms);

// POST: Add Chatroom.
router.post('/room/add', controller.postAddChatroom);

// PUT: Block Chat.
router.put('/room/block', controller.putBlockChat);

// PUT: Unblock Chat.
router.put('/room/unblock', controller.putUnblockChat);

// GET: Get all messages of the given room.
router.get('/room/:roomId/all', controller.getChat);

// POST: Send Message.
router.post('/message/send', controller.postSendMessage);

// DELETE: Delete Message.
router.delete('/message/:id', controller.deleteMessage);

module.exports = router;
