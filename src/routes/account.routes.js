// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { registerTempUser, verifyTempUser } from '../controllers/account.controller.js';

// User Account Related Routes.
const router = Router();

// PUT : Creates a Temporary User Entry in the db.
router.put('/register', registerTempUser);

// PATCH : Verifies the Temporary User Entry in the db.
router.patch('/register/verify', verifyTempUser);

export default router;
