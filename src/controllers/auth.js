// Local Imports.
const getMetadata = require('../utils/metadata');

exports.getCreateAccountPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Create Your Account',
    description:
      'Yapper is a lightweight hobby chat app built for learning and fun. Enjoy clean, fast, real-time conversations without distractions or complexity. Create Your Yapper Account',
    keywords: ['yapper', 'account creation', 'user creation', 'signup', 'registration'],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('create-account', { metadata });
};

exports.getLoginPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Login',
    description:
      'Log in to Yapper — a simple hobby chat app built for learning and experimentation. Sign in to access your chats and continue your conversations.',
    keywords: [
      'yapper login',
      'sign in',
      'chat app login',
      'yapper account',
      'hobby chat app',
      'simple messaging',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('login', { metadata });
};

exports.getForgotPasswordPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Forgot Password',
    description:
      'Reset your Yapper password. Enter your account email or username to receive password reset instructions. Yapper is a simple hobby project—please avoid using sensitive or personal credentials.',
    keywords: [
      'forgot password',
      'reset password',
      'yapper password',
      'account recovery',
      'password reset',
      'hobby chat app',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('forgot-password', { metadata });
};

exports.getChangePasswordPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Change Password',
    description:
      'Update your Yapper account password. This is a simple hobby project, so avoid using sensitive or personal passwords. Change your password to keep your account accessible and up to date.',
    keywords: [
      'change password',
      'update password',
      'yapper settings',
      'account settings',
      'password update',
      'hobby chat app',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('change-password', { metadata });
};
