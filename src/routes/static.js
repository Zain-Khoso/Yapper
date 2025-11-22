// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/static');

const router = Router();

// Routes.

// GET: Landing Page.
router.get('/', controller.getLandingPage);

module.exports = router;
