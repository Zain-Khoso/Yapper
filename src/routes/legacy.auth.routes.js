// Lib Imports.
import { Router } from 'express';

// Local Imports.
import controller from '../controllers/legacy.auth.controller.js';

const router = Router();

// Auth Routes.

// GET: Account Delete.
router.get('/account/delete', controller.getAccountDelete);

// POST: Change Password Token.
router.post('/change-password-token', controller.postActionToken);

// POST: Change Password.
router.post('/change-password/:token', controller.postChangePassword);

// POST: Change Email.
router.post('/change-email', controller.postChangeEmail);

export default router;
