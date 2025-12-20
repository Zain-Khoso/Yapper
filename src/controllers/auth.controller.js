// Lib Imports.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Util Imports.
import sequelize from '../utils/database.js';
import { schema_Email } from '../utils/validations.js';

// Model Imports.
import User from '../models/user.model.js';

async function login(req, res, next) {
  // Extracting Body Data.
  const { email, password } = req.body;

  // Creating a db Transaction.
  const t = await sequelize.transaction();

  try {
    // Validating Body Data.
    const result_email = schema_Email.safeParse(email);

    if (!result_email.success) {
      t.rollback();

      req.response = { errors: { root: 'Invalid Credentials' } };

      return next();
    }

    const user = await User.findOne({ where: { email }, transaction: t });
    if (!user) {
      t.rollback();

      req.response = { errors: { root: 'Invalid Credentials' } };

      return next();
    }

    // Comparing password in db and the given one.
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      t.rollback();

      req.response = { errors: { root: 'Invalid Credentials.' } };

      return next();
    }

    // Generating Access and Refresh tokens.
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30d',
    });

    // Storing the refreshToken in db.
    await user.update({ refreshToken }, { transaction: t });

    // Sending tokens to client.
    res.cookie('yapper.refreshToken', refreshToken, {
      httpOnly: true,
      secure: req.app.locals.isProd,
      sameSite: 'Strict',
      maxAge: 1_000 * 60 * 60 * 24 * 30, // 30 days
    });

    t.commit();

    req.response = { data: { accessToken } };

    next();
  } catch (error) {
    t.rollback();

    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req?.cookies?.['yapper.refreshToken'];

    if (!refreshToken) {
      req.response = { errors: { root: 'Invalid Request' } };

      return next();
    }

    let decoded = null;

    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      res.clearCookie('yapper.refreshToken', {
        httpOnly: true,
        secure: req.app.locals.isProd,
        sameSite: 'Strict',
      });

      req.response = { errors: { root: 'Invalid Request' } };

      return next();
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    req.response = { data: { accessToken } };

    next();
  } catch (error) {
    next(error);
  }
}

export { login, refresh };
