// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/auth.controller');

const router = Router();

// Routes.

// GET: Create Account Page.
router.get('/create-account', controller.getCreateAccountPage);

// GET: Login Page.
router.get('/login', controller.getLoginPage);

// GET: Forgot Password Page.
router.get('/forgot-password', controller.getForgotPasswordPage);

// GET: Change Password Page.
router.get('/change-password', controller.getChangePasswordPage);

// GET: Change Email Page.
router.get('/change-email', controller.getChangeEmailPage);

module.exports = router;
