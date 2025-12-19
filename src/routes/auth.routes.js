// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { login } from '../controllers/auth.controller.js';

// Authentication Routes.
const router = Router();

// PATCH : Logs a user in.
router.patch('/login', login);

export default router;
