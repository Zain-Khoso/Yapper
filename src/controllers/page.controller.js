// Local Imports.
import getMetadata from '../utils/metadata.js';

function getLandingPage(req, res) {
  const metadata = getMetadata({
    absoluteTitle: 'Yapper — Simple Real-Time Chat for Learning & Fun',
    description:
      'Yapper is a lightweight real-time chat application built as a hobby project for learning and experimentation. Chat with friends, explore real-time systems, and build without the pressure of production-grade messaging.',
    keywords: [
      'real-time chat',
      'chat application',
      'web sockets',
      'learning project',
      'side project',
      'node.js',
      'express',
      'mysql',
      'pug',
    ],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('landing', { metadata, bundleName: 'landing' });
}

function getSignUpPage(req, res) {
  const metadata = getMetadata({
    title: 'Sign Up',
    description:
      'Create a Yapper account to start chatting and experimenting with a simple real-time messaging app built for learning and fun.',
    keywords: [
      'sign up',
      'create account',
      'chat app signup',
      'real-time chat',
      'learning project',
    ],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('signup', { metadata, bundleName: 'signup' });
}

function getLoginPage(req, res) {
  const metadata = getMetadata({
    title: 'Log In',
    description:
      'Log in to Yapper to continue chatting with friends and exploring a lightweight real-time chat application built as a learning project.',
    keywords: ['login', 'sign in', 'chat app login', 'real-time messaging', 'yapper'],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('login', { metadata, bundleName: 'login' });
}

function getChangeEmailPage(req, res) {
  const metadata = getMetadata({
    title: 'Change Email',
    description:
      'Update the email address associated with your Yapper account. Changes require verification for security.',
    keywords: ['change email', 'account settings', 'email verification', 'user account', 'yapper'],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('change-email', { metadata, bundleName: 'change-email' });
}

function getChangePasswordPage(req, res) {
  const metadata = getMetadata({
    title: 'Change Password',
    description:
      'Change your Yapper account password securely. Password updates require email verification.',
    keywords: [
      'change password',
      'reset password',
      'account security',
      'chat app account',
      'yapper',
    ],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('change-password', { metadata, bundleName: 'change-password' });
}

function getAccountDeletePage(req, res) {
  const metadata = getMetadata({
    title: 'Delete Account',
    description: 'Permanently delete your Yapper account information.',
    keywords: ['delete account', 'remove profile', 'account management', 'privacy', 'yapper'],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('delete-account', { metadata, bundleName: 'delete-account' });
}

function getSettingsPage(req, res) {
  const metadata = getMetadata({
    title: 'Settings',
    description:
      'Manage your Yapper account settings, including email, password, and personal preferences.',
    keywords: ['settings', 'account settings', 'profile settings', 'user preferences', 'yapper'],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('settings', { metadata, user: {} }); // TODO: remove this user attribute.
}

function getChatPage(req, res) {
  const metadata = getMetadata({
    title: 'Chat',
    description:
      'Chat in real time using Yapper — a lightweight messaging app built for experimentation and learning. Not intended for sensitive communication.',
    keywords: ['chat', 'real-time chat', 'websocket chat', 'messaging app', 'learning project'],
    baseURL: req.protocol + '://' + req.get('host'),
    pagePath: req.originalUrl,
  });

  res.render('chat', { metadata });
}

function getCallsPage(_, res) {
  res.redirect('/chat');
}

export {
  getLandingPage,
  getSignUpPage,
  getLoginPage,
  getChangeEmailPage,
  getChangePasswordPage,
  getAccountDeletePage,
  getSettingsPage,
  getChatPage,
  getCallsPage,
};
