// Lib Imports.
import { Router } from 'express';

// Local Imports.
import {
  blockRoom,
  createChatroom,
  readChatrooms,
  unblockRoom,
} from '../controllers/room.controller.js';
import { allowAuthenticatedUserOnly } from '../utils/auth.utils.js';

// Authentication Routes.
const router = Router();

// POST : Creates a new room for the current user.
router.post('/add', allowAuthenticatedUserOnly, createChatroom);

// GET : Fetches chatrooms of the current user.
router.get('/get-all/:offset', allowAuthenticatedUserOnly, readChatrooms);

// PATCH : Blocks the other user for the current user.
router.patch('/block', allowAuthenticatedUserOnly, blockRoom);

// PATCH : Blocks the other user for the current user.
router.patch('/unblock', allowAuthenticatedUserOnly, unblockRoom);

export default router;
