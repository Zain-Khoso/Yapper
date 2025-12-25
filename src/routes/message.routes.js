// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { createMessage } from '../controllers/message.controller.js';

// Authentication Routes.
const router = Router({ mergeParams: true });

// POST : Create a new message.
router.post('/add', createMessage);

export default router;
