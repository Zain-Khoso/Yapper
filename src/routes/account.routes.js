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
  requestDeletion,
  deleteUser,
  requestEmailChange,
  verifyEmailChangeRequest,
  requestPasswordChange,
  verifyPasswordChangeRequest,
  changePassword,
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

// GET : Sends a confirmation email for account deletion.
router.get('/delete', allowAuthenticatedUserOnly, requestDeletion);

// DELETE : Confirms the given otp and deletes the user from db.
router.delete('/delete', allowAuthenticatedUserOnly, deleteUser);

// POST : Sends a confirmation email to the provided email.
router.post('/change/email', allowAuthenticatedUserOnly, requestEmailChange);

// PATCH : Verifies the the given otp and updates the email address.
router.patch('/change/email', allowAuthenticatedUserOnly, verifyEmailChangeRequest);

// PUT : Sends a confirmation email to the provided email.
router.put('/change/password', requestPasswordChange);

// POST : Verifies the the given otp and grants permission to change password.
router.post('/change/password', verifyPasswordChangeRequest);

// PATCH : Resets a user's password.
router.patch('/change/password', changePassword);

export default router;
