// Lib Imports.
import { Router } from 'express';

// Local Imports.
import {
  getLandingPage,
  getSignUpPage,
  getLoginPage,
  getChangeEmailPage,
  getChangePasswordPage,
  getSettingsPage,
  getChatPage,
  getCallsPage,
} from '../controllers/page.controller.js';
import { getNotFoundPage, getServerErrorPage } from '../controllers/error.controller.js';

const router = Router();

// Routes.

// GET: Landing Page.
router.get('/', getLandingPage);

// GET: Signup Page.
router.get('/signup', getSignUpPage);

// GET: Login Page.
router.get('/login', getLoginPage);

// GET: Change Email Page.
router.get('/change-email', getChangeEmailPage);

// GET: Change Password Page.
router.get('/change-password', getChangePasswordPage);

// GET: Settings Page.
router.get('/settings', getSettingsPage);

// GET: Chatapp Page.
router.get('/chat', getChatPage);

// GET: Calls Page.
router.get('/calls', getCallsPage);

// Handles invalid routes.
router.use(getNotFoundPage);

// Handles server errors for page routes.
router.use(getServerErrorPage);

export default router;
