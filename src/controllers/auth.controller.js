// Local Imports.
import { schema_Email, getZodError } from '../utils/validations.js';
import User from '../models/user.model.js';

export async function postEmailUnique(req, res) {
  // Extracting Body Data.
  const { email } = req.body;

  // Validating Body Data.
  const result = schema_Email.safeParse(email);

  if (!result.success) {
    return res.status(409).json({
      errors: { email: getZodError(result) },
      data: {},
    });
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    return res.status(409).json({ errors: { email: 'Email is already in use' }, data: {} });
  }

  return res.status(200).json({ errors: {}, data: { email } });
}

export function postCreateAccount(req, res) {
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
}

export function postLogin(req, res) {
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
}

export function getLogout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({ errors: { root: 'Something went wrong' } });
    } else {
      res.status(200).json({ errors: {} });
    }
  });
}

export function getAccountDelete(req, res) {
  User.destroy({ where: { email: req.session.user.email } }).then((user) => {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({ errors: { root: 'Something went wrong' } });
      } else {
        res.status(200).json({ errors: {} });
      }
    });
  });
}

export function postChangePassword(req, res, next) {
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
}

export function postChangeEmail(req, res) {
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
}

export function postChangeDisplayName(req, res) {
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
}
