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
  getAccountDeletePage,
} from '../controllers/page.controller.js';
import { getNotFoundPage, getServerErrorPage } from '../controllers/error.controller.js';
import { protectRoute, redirectIfAuthenticated } from '../utils/auth.utils.js';

const router = Router();

// Routes.

// GET: Landing Page.
router.get('/', getLandingPage);

// GET: Signup Page.
router.get('/signup', redirectIfAuthenticated, getSignUpPage);

// GET: Login Page.
router.get('/login', redirectIfAuthenticated, getLoginPage);

// GET: Change Email Page.
router.get('/change-email', protectRoute, getChangeEmailPage);

// GET: Change Password Page.
router.get('/change-password', getChangePasswordPage);

// GET: Account Delete Page.
router.get('/delete-account', protectRoute, getAccountDeletePage);

// GET: Settings Page.
router.get('/settings', protectRoute, getSettingsPage);

// GET: Chatapp Page.
router.get('/chat', protectRoute, getChatPage);

// GET: Calls Page.
router.get('/calls', protectRoute, getCallsPage);

// Handles invalid routes.
router.use(getNotFoundPage);

// Handles server errors for page routes.
router.use(getServerErrorPage);

export default router;
