// Lib Imports.
import { Router } from 'express';

// Local Imports.
import accountRouter from './account.routes.js';
import authRouter from './auth.routes.js';

// API Routes.
const router = Router();

// User Account Routes.
router.use('/account', accountRouter);

// User Authentication Routes.
router.use('/auth', authRouter);

export default router;
