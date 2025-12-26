// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { createMessage, getChat } from '../controllers/message.controller.js';

// Authentication Routes.
const router = Router({ mergeParams: true });

// POST : Create a new message.
router.post('/add', createMessage);

// GET : Get the entire chat of the given chatroom.
router.get('/get-all/:offset', getChat);

export default router;
