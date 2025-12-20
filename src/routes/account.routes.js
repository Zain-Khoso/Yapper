// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { allowAuthenticatedUserOnly } from '../utils/auth.utils.js';
import {
  registerTempUser,
  verifyTempUser,
  createUser,
  getUser,
  updateUser,
} from '../controllers/account.controller.js';

// User Account Related Routes.
const router = Router();

// PUT : Creates a Temporary User Entry in the db.
router.put('/register', registerTempUser);

// PATCH : Verifies the Temporary User Entry in the db.
router.patch('/register/verify', verifyTempUser);

// POST : Creates the Permament User Entry in the db.
router.post('/create', createUser);

// GET : Gets data of the currently signed in user.
router.get('/', allowAuthenticatedUserOnly, getUser);

// PATCH : Updates data of the currently signed in user.
router.patch('/update', allowAuthenticatedUserOnly, updateUser);

export default router;
