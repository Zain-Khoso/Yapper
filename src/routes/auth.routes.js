// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/auth.controller');
const {
  protectFromAuthenticatedUsers,
  protectFromUnAuthenticatedUsers,
} = require('../utils/middlewares');

const router = Router();

// Routes.

// GET: Create Account Page.
router.get('/create-account', protectFromAuthenticatedUsers, controller.getCreateAccountPage);

// GET: Login Page.
router.get('/login', protectFromAuthenticatedUsers, controller.getLoginPage);

// GET: Change Email Page.
router.get('/change-email', protectFromUnAuthenticatedUsers, controller.getChangeEmailPage);

// GET: Forgot Password Page.
router.get('/forgot-password', controller.getForgotPasswordPage);

// GET: Change Password Page.
router.get('/change-password/:token', controller.getChangePasswordPage);

// POST: Create Account.
router.post('/account/create', protectFromAuthenticatedUsers, controller.postCreateAccount);

// POST: Login.
router.post('/account/login', protectFromAuthenticatedUsers, controller.postLogin);

// GET: Logout.
router.get('/account/logout', protectFromUnAuthenticatedUsers, controller.getLogout);

// POST: Change Password Token.
router.post('/change-password-token', controller.postActionToken);

// POST: Change Password.
router.post('/change-password/:token', controller.postChangePassword);

// POST: Change Email.
router.post('/change-email', protectFromUnAuthenticatedUsers, controller.postChangeEmail);

module.exports = router;
