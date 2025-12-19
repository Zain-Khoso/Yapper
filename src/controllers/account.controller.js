// Lib Imports.
import { Op } from 'sequelize';

// Util Imports.
import sequelize from '../utils/database.js';
import { schema_Email, schema_OTP, getZodError } from '../utils/validations.js';
import { generateOTP } from '../utils/otp.js';

// Models.
import Registration from '../models/registration.model.js';
import User from '../models/user.model.js';

async function registerTempUser(req, res, next) {
  // Extracting Body Data.
  const { email } = req.body;

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result = schema_Email.safeParse(email);

    if (!result.success) {
      t.rollback();
      return res.status(409).json({
        data: {},
        errors: { email: getZodError(result) },
      });
    }

    // Check if email is taken by a user.
    const email_Exists = await User.findOne({ where: { email }, transaction: t });
    if (email_Exists) {
      t.rollback();
      return res.status(200).json({ data: {}, errors: { email: 'Email is taken.' } });
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

    res.status(201).json({});

    t.commit();
  } catch (error) {
    t.rollback();

    next(error);
  }
}

async function verifyTempUser(req, res, next) {
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
      return res.status(409).json({
        data: {},
        errors: {
          email: getZodError(result_email),
          otp: getZodError(result_otp),
        },
      });
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
      return res.status(409).json({ data: {}, errors: { otp: 'Invalid OTP' } });
    }

    // Comparing the OTP in db and the user provided OTP.
    if (registration.otp !== otp) {
      t.rollback();
      return res.status(409).json({ data: {}, errors: { otp: 'Invalid OTP' } });
    }

    // Marking the registration as valid.
    await registration.update(
      { otp: null, otpExpires: null, isVerified: true },
      { transaction: t }
    );

    res.status(201).json({});

    t.commit();
  } catch (error) {
    t.rollback();

    next(error);
  }
}

export { registerTempUser, verifyTempUser };
