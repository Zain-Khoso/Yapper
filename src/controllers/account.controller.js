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
import { generateOTP } from '../utils/otp.js';
import { serializeResponse, serializeUser } from '../utils/serializers.js';

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
      t.rollback();

      return res.status(409).json(serializeResponse({}, { email: getZodError(result) }));
    }

    // Check if email is taken by a user.
    const email_Exists = await User.findOne({ where: { email }, transaction: t });
    if (email_Exists) {
      t.rollback();

      return res.status(409).json(serializeResponse({}, { email: 'Email is already in use.' }));
    }

    const otp = generateOTP();

    // Creating a registration row in db to save otp info.
    const [registration, __] = await Registration.upsert(
      {
        email,
        otp,
        otpExpires: new Date(Date.now() + 1000 * 60 * 5),
      },
      { transaction: t }
    );

    // TODO: Send the actual email.
    console.log('\n', 'OTP: ' + registration.otp, '\n');

    t.commit();

    res.status(201).json(serializeResponse());
  } catch (error) {
    t.rollback();

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
      t.rollback();

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
      t.rollback();

      return res.status(409).json(serializeResponse({}, { otp: 'Invalid OTP' }));
    }

    // Comparing the OTP in db and the user provided OTP.
    if (registration.otp !== otp) {
      t.rollback();

      return res.status(409).json(serializeResponse({}, { otp: 'Invalid OTP' }));
    }

    // Marking the registration as valid.
    await registration.update(
      { otp: null, otpExpires: null, isVerified: true },
      { transaction: t }
    );

    t.commit();

    res.status(200).json(serializeResponse());
  } catch (error) {
    t.rollback();

    next(error);
  }
}

async function createUser(req, res, next) {
  // Extracting Body Data.
  let { email, picture, displayName, password } = req.body;

  // Sanitizing body data.
  email = sanitizeEmail(email);
  picture = sanitizeText(picture);
  displayName = sanitizeText(displayName);

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result_email = schema_Email.safeParse(email);
    const result_picture = schema_URL.safeParse(picture);
    const result_displayName = schema_DisplayName.safeParse(displayName);
    const result_password = schema_Password.safeParse(password);

    if (
      !result_email.success ||
      !result_picture.success ||
      !result_displayName.success ||
      !result_password.success
    ) {
      t.rollback();

      return res.status(409).json(
        serializeResponse(
          {},
          {
            email: getZodError(result_email),
            picture: getZodError(result_picture),
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
      t.rollback();

      return res.status(400).json(serializeResponse({}, { root: 'Invalid Request' }));
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.PASSWORD_SALT));
    const password_hash = await bcrypt.hash(password, salt);

    await Promise.all([
      User.create(
        { email, picture: null, displayName, password: password_hash },
        { transaction: t }
      ),
      registration.destroy({ transaction: t }),
    ]);

    t.commit();

    return res.status(201).json(serializeResponse());
  } catch (error) {
    t.rollback();

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

  // Updating current User's data.
  const updatedUser = {};
  if (picture || picture === null) updatedUser.picture = picture;
  if (displayName) updatedUser.displayName = displayName;

  const user = await req.user.update(updatedUser);

  return res.status(200).json(serializeResponse(serializeUser(user)));
}

async function requestDeletion(req, res) {
  const user = req.user;

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

export { registerTempUser, verifyTempUser, createUser, getUser, updateUser, requestDeletion };
