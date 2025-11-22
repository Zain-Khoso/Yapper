// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/auth');

const router = Router();

// Routes.

// GET: Create Account Page.
router.get('/create-account', controller.getCreateAccountPage);

module.exports = router;
