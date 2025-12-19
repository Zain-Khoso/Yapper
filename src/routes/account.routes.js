// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { registerTempUser } from '../controllers/account.controller.js';

// User Account Related Routes.
const router = Router();

// PUT : Create a Temporary User entry in the Database.
router.put('/register', registerTempUser);

export default router;
