// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { createChatroom } from '../controllers/room.controller.js';
import { allowAuthenticatedUserOnly } from '../utils/auth.utils.js';

// Authentication Routes.
const router = Router();

// POST : Creates a new room for the current user.
router.post('/add', allowAuthenticatedUserOnly, createChatroom);

export default router;
