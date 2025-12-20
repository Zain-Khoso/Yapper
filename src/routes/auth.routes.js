// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { login, refresh, logout } from '../controllers/auth.controller.js';

// Authentication Routes.
const router = Router();

// PATCH : Logs a user in.
router.patch('/login', login);

// GET : Refreshes the access token.
router.get('/refresh', refresh);

// GET : Removes the refreshToken cookie.
router.get('/logout', logout);

export default router;
