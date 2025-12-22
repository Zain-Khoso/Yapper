// Lib Imports.
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import z from 'zod';

// Util Imports.
import sequelize from '../utils/database.js';
import {
  schema_Email,
  schema_OTP,
  schema_DisplayName,
  schema_Password,
  schema_URL,
  getZodError,
} from '../utils/validations.js';
import { deleteOldImage, generateOTP } from '../utils/helpers.js';
import { serializeResponse, serializeUser } from '../utils/serializers.js';
import { removeRefreshTokenCookie } from '../utils/auth.utils.js';

// Models.
import Registration from '../models/registration.model.js';
import User from '../models/user.model.js';
import { sanitizeEmail, sanitizeText } from '../utils/sanitizers.js';

async function registerTempUser(req, res, next) {
  // Extracting Body Data.
  let { email } = req.body;

  // Sanitizing body data.
  email = sanitizeEmail(email);

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result = schema_Email.safeParse(email);

    if (!result.success) {
      await t.rollback();

      return res.status(409).json(serializeResponse({}, { email: getZodError(result) }));
    }

    // Check if email is taken by a user.
    const email_Exists = await User.findOne({
      where: { [Op.or]: [{ email }, { newEmail: email }] },
      transaction: t,
    });
    if (email_Exists) {
      await t.rollback();

      return res.status(409).json(serializeResponse({}, { email: 'This email is taken.' }));
    }

    const registration = await Registration.findOne({ where: { email }, transaction: t });
    const otp = generateOTP();

    if (registration) {
      if (registration.isVerified) {
        await t.rollback();
        return res.status(409).json(serializeResponse({}, { email: 'This email is taken.' }));
      }

      // OTP COOLDOWN.
      if (registration.otpExpires > new Date(Date.now() + 1_000 * 60 * 4)) {
        await t.rollback();
        return res
          .status(429)
          .json(serializeResponse({ root: 'Please wait before requesting again.' }));
      }

      await registration.update(
        { otp, otpExpires: new Date(Date.now() + 1000 * 60 * 5) },
        { transaction: t }
      );
    } else {
      await Registration.create(
        { email, otp, otpExpires: new Date(Date.now() + 1000 * 60 * 5) },
        { transaction: t }
      );
    }

    // TODO: Send the actual email.
    console.log('\n', 'OTP: ' + otp, '\n');

    await t.commit();

    res.status(201).json(serializeResponse());
  } catch (error) {
    await t.rollback();

    next(error);
  }
}

async function verifyTempUser(req, res, next) {
  // Extracting Body Data.
  let { email, otp } = req.body;

  // Sanitizing body data.
  email = sanitizeEmail(email);

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result_email = schema_Email.safeParse(email);
    const result_otp = schema_OTP.safeParse(otp);

    if (!result_email.success || !result_otp.success) {
      await t.rollback();

      return res.status(409).json(
        serializeResponse(
          {},
          {
            email: getZodError(result_email),
            otp: getZodError(result_otp),
          }
        )
      );
    }

    const registration = await Registration.findOne({
      where: {
        email,
        otpExpires: { [Op.gt]: new Date() },
      },
      transaction: t,
    });
    if (!registration) {
      await t.rollback();

      return res.status(409).json(serializeResponse({}, { otp: 'Invalid OTP' }));
    }

    // Comparing the OTP in db and the user provided OTP.
    if (registration.otp !== otp) {
      await t.rollback();

      return res.status(409).json(serializeResponse({}, { otp: 'Invalid OTP' }));
    }

    // Marking the registration as valid.
    await registration.update(
      { otp: null, otpExpires: null, isVerified: true },
      { transaction: t }
    );

    await t.commit();

    res.status(200).json(serializeResponse());
  } catch (error) {
    await t.rollback();

    next(error);
  }
}

async function createUser(req, res, next) {
  // Extracting Body Data.
  let { email, displayName, password } = req.body;

  // Sanitizing body data.
  email = sanitizeEmail(email);
  displayName = sanitizeText(displayName);

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result_email = schema_Email.safeParse(email);
    const result_displayName = schema_DisplayName.safeParse(displayName);
    const result_password = schema_Password.safeParse(password);

    if (!result_email.success || !result_displayName.success || !result_password.success) {
      await t.rollback();

      return res.status(409).json(
        serializeResponse(
          {},
          {
            email: getZodError(result_email),
            displayName: getZodError(result_displayName),
            password: getZodError(result_password),
          }
        )
      );
    }

    const registration = await Registration.findOne({
      where: { email, isVerified: true },
      transaction: t,
    });
    if (!registration) {
      await t.rollback();

      return res.status(400).json(serializeResponse({}, { root: 'Invalid Request' }));
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.PASSWORD_SALT));
    const password_hash = await bcrypt.hash(password, salt);

    await Promise.all([
      User.create({ email, displayName, password: password_hash }, { transaction: t }),
      registration.destroy({ transaction: t }),
    ]);

    await t.commit();

    return res.status(201).json(serializeResponse());
  } catch (error) {
    await t.rollback();

    next(error);
  }
}

async function getUser(req, res) {
  res.status(200).json(serializeResponse(serializeUser(req.user)));
}

async function updateUser(req, res) {
  // Extracting Body Data.
  let { picture, displayName } = req.body;

  // Sanitizing body data.
  picture = sanitizeText(picture);
  displayName = sanitizeText(displayName);

  // Validating Body Data.
  const result_picture = schema_URL.safeParse(picture);
  const result_displayName = schema_DisplayName
    .optional()
    .or(z.literal(null))
    .safeParse(displayName);

  if (!result_picture.success || !result_displayName.success) {
    return res.status(409).json(
      serializeResponse(
        {},
        {
          picture: getZodError(result_picture),
          displayName: getZodError(result_displayName),
        }
      )
    );
  }

  // If a new Image is provided, deletes the old image.
  if (picture) await deleteOldImage(req.user.picture);

  // Updating current User's data.
  const updatedUser = {};
  if (picture || picture === null) updatedUser.picture = picture;
  if (displayName) updatedUser.displayName = displayName;

  const user = await req.user.update(updatedUser);

  return res.status(200).json(serializeResponse(serializeUser(user)));
}

async function requestDeletion(req, res) {
  const user = req.user;

  // OTP COOLDOWN.
  if (user.otpExpires > new Date(Date.now() + 1_000 * 60 * 4)) {
    return res
      .status(429)
      .json(serializeResponse({ root: 'Please wait before requesting again.' }));
  }

  // Generating OTP.
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 1_000 * 60 * 5); // Five minutes.
  const otpAction = 'account-delete';

  // Storing otp in db.
  await user.update({ otp, otpExpires, otpAction });

  // TODO: Send otp through an actual email.
  console.log('\n', otp, '\n');

  return res.status(200).json(serializeResponse());
}

async function deleteUser(req, res) {
  const user = req.user;

  if (!user?.otp || !user?.otpExpires || user?.otpAction !== 'account-delete') {
    return res.status(400).json(serializeResponse({}, { root: 'Invalid Request' }));
  }

  // Extracting & Validating Body Data.
  let { otp } = req.body;
  const result = schema_OTP.safeParse(otp);

  if (!result.success) {
    return res.status(409).json(
      serializeResponse(
        {},
        {
          otp: getZodError(result),
        }
      )
    );
  }

  // Validating the given OTP with user in db.
  if (user.otp !== otp || user.otpExpires < new Date()) {
    return res.status(409).json(
      serializeResponse(
        {},
        {
          otp: 'Invalid OTP',
        }
      )
    );
  }

  await user.destroy();
  removeRefreshTokenCookie(res);
  res.status(200).json(serializeResponse());
}

async function requestEmailChange(req, res, next) {
  const user = req.user;

  // OTP COOLDOWN.
  if (user.otpExpires > new Date(Date.now() + 1_000 * 60 * 4)) {
    return res
      .status(429)
      .json(serializeResponse({ root: 'Please wait before requesting again.' }));
  }

  // Working body data.
  let { email } = req.body;
  email = sanitizeEmail(email);

  const result = schema_Email.safeParse(email);
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { email: getZodError(result) }));
  }

  if (user.email === email) {
    return res.status(409).json(serializeResponse({}, { email: 'This email is taken.' }));
  }

  const t = await sequelize.transaction();

  try {
    // Checking if a user already exists with this email.
    const userExists = await User.scope('full').findOne({
      where: { [Op.or]: [{ email }, { newEmail: email }] },
      transaction: t,
    });
    if (userExists && userExists.id !== user.id) {
      await t.rollback();
      return res.status(409).json(serializeResponse({}, { email: 'This email is taken.' }));
    }

    // Generating OTP.
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 1_000 * 60 * 5); // Five minutes.
    const otpAction = 'email-change';

    // Storing otp in db.
    await user.update({ otp, otpExpires, otpAction, newEmail: email });

    // TODO: Send otp through an actual email.
    console.log('\n', otp, '\n');

    await t.commit();
    return res.status(200).json(serializeResponse());
  } catch (error) {
    await t.rollback();

    next(error);
  }
}

async function verifyEmailChangeRequest(req, res) {
  const user = req.user;

  if (!user?.otp || !user?.otpExpires || user?.otpAction !== 'email-change' || !user?.newEmail) {
    return res.status(400).json(serializeResponse({}, { root: 'Invalid Request' }));
  }

  // Extracting & Validating Body Data.
  let { otp } = req.body;
  const result = schema_OTP.safeParse(otp);
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { otp: getZodError(result) }));
  }

  // Validating the given OTP with user in db.
  if (user.otp !== otp || user.otpExpires < new Date()) {
    return res.status(409).json(serializeResponse({}, { otp: 'Invalid OTP' }));
  }

  await user.update({
    email: user.newEmail,
    otp: null,
    otpExpires: null,
    otpAction: null,
    newEmail: null,
  });

  removeRefreshTokenCookie(res);
  res.status(200).json(serializeResponse());
}

async function requestPasswordChange(req, res, next) {
  let { email } = req.body;
  email = sanitizeEmail(email);

  const result = schema_Email.safeParse(email);
  if (!result.success) {
    return res.status(409).json(serializeResponse({}, { email: getZodError(result) }));
  }

  const t = await sequelize.transaction();

  try {
    const user = await User.scope('full').findOne({ where: { email }, transaction: t });

    // Silent fail if user doesn't exist (prevents email enumeration)
    if (!user) {
      await t.rollback();
      return res.status(200).json(serializeResponse());
    }

    // OTP COOLDOWN
    if (user.otpExpires > new Date(Date.now() + 1_000 * 60 * 4)) {
      await t.rollback();
      return res
        .status(429)
        .json(serializeResponse({ root: 'Please wait before requesting again.' }));
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 1_000 * 60 * 5);
    const otpAction = 'password-change';

    await user.update(
      {
        otp,
        otpExpires,
        otpAction,
        canChangePassword: false,
      },
      { transaction: t }
    );

    // TODO: Send Email
    console.log('\nPassword Reset OTP:', otp, '\n');

    await t.commit();
    return res.status(200).json(serializeResponse());
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

async function verifyPasswordChangeRequest(req, res) {
  let { email, otp } = req.body;
  email = sanitizeEmail(email);

  const result_Email = schema_Email.safeParse(email);
  const result_OTP = schema_OTP.safeParse(otp);

  if (!result_Email.success || !result_OTP.success) {
    return res.status(409).json(
      serializeResponse(
        {},
        {
          email: getZodError(result_Email),
          otp: getZodError(result_OTP),
        }
      )
    );
  }

  const user = await User.scope('full').findOne({ where: { email } });

  if (
    !user ||
    user.otpAction !== 'password-change' ||
    user.otp !== otp ||
    user.otpExpires < new Date()
  ) {
    return res.status(409).json(serializeResponse({}, { otp: 'Invalid OTP' }));
  }

  await user.update({
    otp: null,
    otpExpires: null,
    otpAction: null,
    canChangePassword: true,
  });

  return res.status(200).json(serializeResponse());
}

async function changePassword(req, res, next) {
  let { email, password } = req.body;
  email = sanitizeEmail(email);

  const result_Email = schema_Email.safeParse(email);
  const result_Password = schema_Password.safeParse(password);

  if (!result_Email.success || !result_Password.success) {
    return res.status(409).json(
      serializeResponse(
        {},
        {
          email: getZodError(result_Email),
          password: getZodError(result_Password),
        }
      )
    );
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.PASSWORD_SALT));
  const password_hash = await bcrypt.hash(password, salt);

  const t = await sequelize.transaction();

  try {
    const user = await User.findOne({ where: { email }, transaction: t });

    if (!user || !user.canChangePassword) {
      await t.rollback();
      return res.status(400).json(serializeResponse({}, { root: 'Invalid Request' }));
    }

    await user.update(
      {
        password: password_hash,
        canChangePassword: false,
      },
      { transaction: t }
    );

    await t.commit();
    return res.status(200).json(serializeResponse());
  } catch (error) {
    await t.rollback();
    next(error);
  }
}

export {
  registerTempUser,
  verifyTempUser,
  createUser,
  getUser,
  updateUser,
  requestDeletion,
  deleteUser,
  requestEmailChange,
  verifyEmailChangeRequest,
  requestPasswordChange,
  verifyPasswordChangeRequest,
  changePassword,
};
