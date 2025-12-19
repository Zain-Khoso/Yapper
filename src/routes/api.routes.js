// Lib Imports.
import { Router } from 'express';

// Local Imports.
import accountRouter from './account.routes.js';

// API Routes.
const router = Router();

// User Account Routes.
router.use('/account', accountRouter);

export default router;
