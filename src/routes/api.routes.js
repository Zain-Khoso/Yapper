// Lib Imports.
import { Router } from 'express';

// Local Imports.
import authRouter from './auth.routes.js';

const router = Router();

// API Routes.

// Authentication Routes.
router.use('/account', authRouter);

export default router;
