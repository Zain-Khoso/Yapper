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

// PUT: Block Chat.
router.put('/room/block', controller.putBlockChat);

// PUT: Unblock Chat.
router.put('/room/unblock', controller.putUnblockChat);

// PUT: Update Read Receipt.
router.put('/room/read-receipt', controller.putUpdateReadReceipt);

// GET: Get all messages of the given room.
router.get('/room/:roomId/all', controller.getChat);

// POST: Send Message.
router.post('/message/send', controller.postSendMessage);

// DELETE: Delete Message.
router.delete('/message/:id', controller.deleteMessage);

// POST: Get presigned file upload URLs.
router.post('/file/signature', controller.postGetFileSignature);

// POST: Download files.
router.post('/file/download', controller.postDownloadFile);

module.exports = router;
