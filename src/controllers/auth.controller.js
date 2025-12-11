// Node Imports.
const { randomBytes } = require('crypto');

// Lib Imports.
const validator = require('validator');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const sendGrid = require('@sendgrid/mail');

// Local Imports.
const getMetadata = require('../utils/metadata');
const User = require('../models/user.model');
const { schema_email, schema_displayName, schema_password } = require('../utils/validations');

// Configs.
sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

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

exports.postLogin = function (req, res) {
  let { email, password } = req.body;

  // Sanitizing body data.
  email = validator.trim(email);
  email = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });
  password = validator.trim(password);

  User.findOne({ where: { email } })
    .then((user) => {
      if (!user)
        return Promise.reject({ email: 'Invalid credential.', password: 'Invalid credential.' });

      return Promise.all([user, bcrypt.compare(password, user.password)]);
    })
    .then(([user, isPasswordValid]) => {
      if (!isPasswordValid)
        return Promise.reject({ email: 'Invalid credential.', password: 'Invalid credential.' });

      req.session.isAuthenticated = true;
      req.session.user = user;

      res.status(200).json({ errors: {} });
    })
    .catch((errors) => {
      if (!Object.keys(errors).includes('email')) {
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

exports.getLogout = function (req, res) {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ errors: { root: 'Something went wrong' } });
    } else {
      res.status(200).json({ errors: {} });
    }
  });
};

exports.getAccountDelete = function (req, res) {
  User.destroy({ where: { email: req.session.user.email } }).then((user) => {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({ errors: { root: 'Something went wrong' } });
      } else {
        res.status(200).json({ errors: {} });
      }
    });
  });
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

exports.postActionToken = function (req, res) {
  let { email, sendEmail = false } = req.body;

  // Sanitizing body data.
  email = validator.trim(email);
  email = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });

  const actionToken = randomBytes(16).toString('hex');
  const actionTokenExpires = new Date(Date.now() + 1000 * 60 * 5);
  const isProd = req.app.get('env') === 'production';

  const redirectTo = `${isProd ? 'https' : 'http'}://${req.hostname}${isProd ? '' : ':' + process.env.PORT}/change-password/${actionToken}`;

  User.update({ actionToken, actionTokenExpires }, { where: { email } })
    .then((response) => {
      if (response.at(0) <= 0) return Promise.reject({ email: 'Invalid email.' });

      if (sendEmail) {
        res.status(202).json();

        return sendGrid.send({
          to: email,
          from: process.env.YAPPER_EMAIL,
          subject: 'Yapper Account Password Reset',
          text: `To reset your password on Yapper. Follow this link: ${redirectTo}`,
          html: `
            <p>
              To reset your password on Yapper. Follow this link: <a href="${redirectTo}">${redirectTo}</a>
            </p>
          `,
        });
      } else res.status(202).json({ redirectTo });
    })
    .catch((errors) => {
      if (!Object.keys(errors).includes('email')) {
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

exports.getChangePasswordPage = function (req, res, next) {
  const { token } = req.params;

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

  User.findOne({
    where: {
      [Op.and]: [{ actionToken: token }, { actionTokenExpires: { [Op.gt]: new Date(Date.now()) } }],
    },
  })
    .then((user) => {
      if (!user) return next(Error('Invalid Token'));

      res.render('change-password', { metadata });
    })
    .catch((error) => next(Error(error)));
};

exports.postChangePassword = function (req, res, next) {
  const { token } = req.params;
  let { password } = req.body;

  // Sanitizing body data.
  password = validator.trim(password);

  // Validating body data.
  const result_password = schema_password.safeParse(password);

  if (!result_password.success) {
    return res.status(409).json({
      errors: {
        newPassword: result_password?.error?.issues?.at(0)?.message || null,
      },
    });
  }

  bcrypt
    .genSalt(parseInt(process.env.PASSWORD_SALT))
    .then((salt) => bcrypt.hash(password, salt))
    .then((hashedPassword) => {
      return User.update(
        {
          password: hashedPassword,
        },
        {
          where: {
            [Op.and]: [
              { actionToken: token },
              { actionTokenExpires: { [Op.gt]: new Date(Date.now()) } },
            ],
          },
        }
      );
    })
    .then((response) => {
      if (response.at(0) <= 0) return Promise.reject();

      res.status(202).json({});
    })
    .catch((error) => {
      return res.status(500).json({
        errors: {
          root: 'Something went wrong.',
        },
      });
    });
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

  res.render('change-email', {
    metadata,
    user: req.session.user,
  });
};

exports.postChangeEmail = function (req, res) {
  let { newEmail } = req.body;

  // Sanitizing body data.
  newEmail = validator.trim(newEmail);
  newEmail = validator.normalizeEmail(newEmail, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  });

  // Validating body data.
  const result_newEmail = schema_email.safeParse(newEmail);

  if (!result_newEmail.success) {
    return res.status(409).json({
      errors: {
        newEmail: result_newEmail?.error?.issues?.at(0)?.message || null,
      },
    });
  }

  User.findOne({ where: { email: newEmail } })
    .then((user) => {
      if (user) return Promise.reject({ newEmail: 'User already exists with this email.' });

      return User.update({ email: newEmail }, { where: { email: req.session.user.email } });
    })
    .then(() => {
      req.session.user.email = newEmail;

      res.status(201).json({ errors: {} });
    })
    .catch((errors) => {
      if (!Object.keys(errors).includes('newEmail')) {
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

exports.postChangeDisplayName = function (req, res) {
  let { displayName } = req.body;

  // Sanitizing body data.
  displayName = validator.trim(displayName);

  // Validating body data.
  const result_displayName = schema_displayName.safeParse(displayName);

  if (!result_displayName.success) {
    return res.status(409).json({
      errors: {
        root: result_displayName?.error?.issues?.at(0)?.message || null,
      },
    });
  }

  User.update({ displayName }, { where: { email: req.session.user.email } })
    .then((response) => {
      if (response.at(0) <= 0) return Promise.reject();

      req.session.user.displayName = displayName;

      res.status(202).json({ errors: {} });
    })
    .catch((errors) => {
      res.status(500).json({
        errors: {
          root: 'Something went wrong.',
        },
      });
    });
};
