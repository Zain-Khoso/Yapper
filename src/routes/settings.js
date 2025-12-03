// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/settings');

const router = Router();

// Routes.

// GET: Settings Page.
router.get('/', controller.getSettingsPage);

// GET: Account Page.
router.get('/account', controller.getAccountPage);

module.exports = router;
