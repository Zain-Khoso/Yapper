// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/page.controller');

const router = Router();

// Routes.

// GET: Landing Page.
router.get('/', controller.getLandingPage);

// GET: Signup Page.
router.get('/signup', controller.getSignUpPage);

// GET: Login Page.
router.get('/login', controller.getLoginPage);

// GET: Change Email Page.
router.get('/change-email', controller.getChangeEmailPage);

// GET: Change Password Page.
router.get('/change-password', controller.getChangePasswordPage);

// GET: Settings Page.
router.get('/settings', controller.getSettingsPage);

// GET: Chatapp Page.
router.get('/chat', controller.getChatPage);

// GET: Calls Page.
router.get('/calls', controller.getCallsPage);

module.exports = router;
