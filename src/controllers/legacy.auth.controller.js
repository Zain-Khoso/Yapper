// Local Imports.
import User from '../models/user.model.js';

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
