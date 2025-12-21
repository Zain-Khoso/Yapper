// Lib Imports.
import { Router } from 'express';

// Local Imports.
import accountRouter from './account.routes.js';
import authRouter from './auth.routes.js';
import uploadRouter from './upload.routes.js';
import { notFoundError, serverError } from '../controllers/error.controller.js';

// API Routes.
const router = Router();

// User Account Routes.
router.use('/account', accountRouter);

// User Authentication Routes.
router.use('/auth', authRouter);

// File Upload Routes.
router.use('/upload', uploadRouter);

// Handles invalid API Endpoints.
router.use(notFoundError);

// Handles server errors for API routes secifically.
router.use(serverError);

export default router;
