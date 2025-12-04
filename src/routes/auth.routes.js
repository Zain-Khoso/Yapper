// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/auth.controller');

const router = Router();

// Routes.

// GET: Create Account Page.
router.get('/create-account', controller.getCreateAccountPage);

// POST: Create Account.
router.post('/account/create', controller.postCreateAccount);

// GET: Login Page.
router.get('/login', controller.getLoginPage);

// POST: Login.
router.post('/account/login', controller.postLogin);

// GET: Forgot Password Page.
router.get('/forgot-password', controller.getForgotPasswordPage);

// GET: Change Password Page.
router.get('/change-password', controller.getChangePasswordPage);

// GET: Change Email Page.
router.get('/change-email', controller.getChangeEmailPage);

module.exports = router;
