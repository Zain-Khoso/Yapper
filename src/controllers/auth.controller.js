// Lib Imports.
const validator = require('validator');
const bcrypt = require('bcrypt');

// Local Imports.
const getMetadata = require('../utils/metadata');
const User = require('../models/user.model');
const { schema_email, schema_displayName, schema_password } = require('../utils/validations');

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

exports.postCreateAccount = function (req, res) {
  let { email, displayName, password } = req.body;

  // Sanitizing body data.
  email = validator.trim(email);
  email = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });
  displayName = validator.trim(displayName);
  password = validator.trim(password);

  // Validating body data.
  const result_email = schema_email.safeParse(email);
  const result_displayName = schema_displayName.safeParse(displayName);
  const result_password = schema_password.safeParse(password);

  if (!result_email.success || !result_displayName.success || !result_password.success) {
    return res.status(409).json({
      errors: {
        email: result_email?.error?.issues?.at(0)?.message || null,
        displayName: result_displayName?.error?.issues?.at(0)?.message || null,
        password: result_password?.error?.issues?.at(0)?.message || null,
      },
    });
  }

  User.findOne({ where: { email } })
    .then((user) => {
      if (user) return Promise.reject({ email: 'User already exists with this email.' });

      return bcrypt.genSalt(parseInt(process.env.PASSWORD_SALT));
    })
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => User.create({ email, displayName, password: hashedPassword }))
    .then(() => res.status(201).json({ errors: {} }))
    .catch((errors) => {
      if (!Object.keys(errors).includes('email')) {
        console.log(errors);
        return res.status(500).json({
          errors: {
            root: 'Something went wrong.',
          },
        });
      }

      res.status(409).json({
        errors,
      });
    });
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

exports.getChangeEmailPage = function (req, res) {
  const metadata = getMetadata({
    title: 'Change Email',
    description:
      'Update the email associated with your Yapper account. Yapper is a simple hobby chat app, so email changes may not be permanent if the database resets.',
    keywords: [
      'change email',
      'update email',
      'yapper settings',
      'account settings',
      'email update',
      'hobby chat app',
    ],
    url: { hostname: req.hostname, path: req.url },
  });

  res.render('change-email', { metadata });
};
