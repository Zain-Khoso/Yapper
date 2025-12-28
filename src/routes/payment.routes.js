// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { checkout } from '../controllers/payment.controller.js';
import { allowAuthenticatedUserOnly } from '../utils/auth.utils.js';

// API Routes.
const router = Router();

// Payment related routes.

// POST: Creates a checkout session.
router.post('/checkout', allowAuthenticatedUserOnly, checkout);

export default router;
