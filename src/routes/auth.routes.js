// Lib Imports.
import { Router } from 'express';

// Local Imports.
import { postEmailUnique } from '../controllers/auth.controller.js';

const router = Router();

// Auth Routes.

// POST: Email Uniqueness Check.
router.post('/email/unique', postEmailUnique);

export default router;

// // POST: Create Account.
// router.post('/account/create', protectFromAuthenticatedUsers, controller.postCreateAccount);

// // POST: Login.
// router.post('/account/login', protectFromAuthenticatedUsers, controller.postLogin);

// // GET: Logout.
// router.get('/account/logout', protectFromUnAuthenticatedUsers, controller.getLogout);

// // GET: Account Delete.
// router.get('/account/delete', protectFromUnAuthenticatedUsers, controller.getAccountDelete);

// // POST: Change Password Token.
// router.post('/change-password-token', controller.postActionToken);

// // POST: Change Password.
// router.post('/change-password/:token', controller.postChangePassword);

// // POST: Change Email.
// router.post('/change-email', protectFromUnAuthenticatedUsers, controller.postChangeEmail);

// // POST: Change Display Name.
// router.post(
//   '/change-displayName',
//   protectFromUnAuthenticatedUsers,
//   controller.postChangeDisplayName
// );

// module.exports = router;
