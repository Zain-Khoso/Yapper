// Lib Imports.
const { Router } = require('express');

// Local Imports.
const controller = require('../controllers/static');

const router = Router();

// Routes.

// GET: Landing Page.
router.get('/', controller.getLandingPage);

// GET: Terms and Conditions Page.
router.get('/terms-and-conditions', controller.getTermsAndConditionsPage);

// GET: Privacy Policy Page.
router.get('/privacy-policy', controller.getPrivacyPolicyPage);

module.exports = router;
