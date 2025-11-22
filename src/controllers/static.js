// Local Imports.
const getMetadata = require('../utils/metadata');

exports.getLandingPage = function (req, res) {
  const metadata = getMetadata({
    title: 'The Simple Chat App',
    description:
      'Yapper is a lightweight hobby chat app built for learning and fun. Enjoy clean, fast, real-time conversations without distractions or complexity. Not a production tool—just a simple place to chat and experiment.',
    keywords: [
      'yapper',
      'chat app',
      'real-time chat',
      'hobby project',
      'express chat',
      'simple messaging',
      'minimal chat app',
      'nodejs chat',
      'learning project',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('landing', { metadata });
};

exports.getTermsAndConditionsPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Terms & Conditions',
    description:
      'Read the Terms & Conditions for Yapper — a simple hobby chat app built for learning and experimentation. This page explains the limitations, risks, and usage guidelines for using Yapper.',
    keywords: [
      'yapper terms',
      'yapper conditions',
      'terms and conditions',
      'chat app terms',
      'hobby project policies',
      'usage guidelines',
      'yapper legal',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('terms-and-conditions', { metadata });
};

exports.getPrivacyPolicyPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Privacy Policy',
    description:
      'Read the Privacy Policy for Yapper — a simple hobby chat app built for learning and experimentation. This page explains the limitations, risks, and usage guidelines for using Yapper.',
    keywords: [
      'yapper policy',
      'yapper privacy',
      'privacy policy',
      'chat app policies',
      'hobby project policies',
      'usage guidelines',
      'yapper legal',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('privacy-policy', { metadata });
};
