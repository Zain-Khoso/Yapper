// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/chat.controller');
const { protectFromUnAuthenticatedUsers } = require('../utils/middlewares');

const router = Router();

// Routes.

// GET: Chat Page.
router.get('/chat', protectFromUnAuthenticatedUsers, controller.getChatPage);

module.exports = router;
