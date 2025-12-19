// Lib Imports.
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

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

// Models.
import Registration from '../models/registration.model.js';
import User from '../models/user.model.js';

async function registerTempUser(req, _, next) {
  // Extracting Body Data.
  const { email } = req.body;

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result = schema_Email.safeParse(email);

    if (!result.success) {
      t.rollback();

      req.response = { errors: { email: getZodError(result) } };
      return next();
    }

    // Check if email is taken by a user.
    const email_Exists = await User.findOne({ where: { email }, transaction: t });
    if (email_Exists) {
      t.rollback();

      req.response = { errors: { email: 'Email is already in use.' } };
      return next();
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

    req.response = {};
    next();
  } catch (error) {
    t.rollback();

    next(error);
  }
}

async function verifyTempUser(req, _, next) {
  // Extracting Body Data.
  const { email, otp } = req.body;

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result_email = schema_Email.safeParse(email);
    const result_otp = schema_OTP.safeParse(otp);

    if (!result_email.success || !result_otp.success) {
      t.rollback();

      req.response = {
        errors: {
          email: getZodError(result_email),
          otp: getZodError(result_otp),
        },
      };
      return next();
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

      req.response = { errors: { otp: 'Invalid OTP' } };
      return next();
    }

    // Comparing the OTP in db and the user provided OTP.
    if (registration.otp !== otp) {
      t.rollback();

      req.response = { errors: { otp: 'Invalid OTP' } };
      return next();
    }

    // Marking the registration as valid.
    await registration.update(
      { otp: null, otpExpires: null, isVerified: true },
      { transaction: t }
    );

    t.commit();

    req.response = {};
    return next();
  } catch (error) {
    t.rollback();

    next(error);
  }
}

async function createUser(req, res, next) {
  // Extracting Body Data.
  const { email, picture, displayName, password } = req.body;

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

      req.response = {
        errors: {
          email: getZodError(result_email),
          picture: getZodError(result_picture),
          displayName: getZodError(result_displayName),
          password: getZodError(result_password),
        },
      };
      return next();
    }

    const registration = await Registration.findOne({
      where: { email, isVerified: true },
      transaction: t,
    });
    if (!registration) {
      t.rollback();

      req.response = { errors: { root: 'Invalid Request' } };

      return next();
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

    req.response = {};
    return next();
  } catch (error) {
    t.rollback();

    next(error);
  }
}

export { registerTempUser, verifyTempUser, createUser };
