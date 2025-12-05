// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/auth.controller');
const { getServerErrorPage } = require('../controllers/static.controller');
const {
  protectFromAuthenticatedUsers,
  protectFromUnAuthenticatedUsers,
} = require('../utils/middlewares');

const router = Router();

// Routes.

// GET: Create Account Page.
router.get('/create-account', protectFromAuthenticatedUsers, controller.getCreateAccountPage);

// POST: Create Account.
router.post('/account/create', protectFromAuthenticatedUsers, controller.postCreateAccount);

// GET: Login Page.
router.get('/login', protectFromAuthenticatedUsers, controller.getLoginPage);

// POST: Login.
router.post('/account/login', protectFromAuthenticatedUsers, controller.postLogin);

// GET: Logout.
router.get('/account/logout', protectFromUnAuthenticatedUsers, controller.getLogout);

// GET: Forgot Password Page.
router.get('/forgot-password', controller.getForgotPasswordPage);

// POST: Change Password Token.
router.post('/change-password-token', controller.postActionToken);

// GET: Change Password Page.
router.get('/change-password/:token', controller.getChangePasswordPage);

// POST: Change Password.
router.post('/change-password/:token', controller.postChangePassword);

// GET: Change Email Page.
router.get('/change-email', protectFromUnAuthenticatedUsers, controller.getChangeEmailPage);

// POST: Change Email.
router.post('/change-email', protectFromUnAuthenticatedUsers, controller.postChangeEmail);

module.exports = router;
