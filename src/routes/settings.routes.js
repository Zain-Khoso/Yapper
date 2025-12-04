// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/settings.controller');
const { protectFromUnAuthenticatedUsers } = require('../utils/middlewares');

const router = Router();

// Routes.

// GET: Settings Page.
router.get('/', protectFromUnAuthenticatedUsers, controller.getSettingsPage);

// GET: Account Page.
router.get('/account', protectFromUnAuthenticatedUsers, controller.getAccountPage);

module.exports = router;
