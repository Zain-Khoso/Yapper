// Lib Imports.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Util Imports.
import { schema_Email } from '../utils/validations.js';

// Model Imports.
import User from '../models/user.model.js';

async function login(req, res, next) {
  // Extracting Body Data.
  const { email, password } = req.body;

  try {
    // Validating Body Data.
    const result_email = schema_Email.safeParse(email);

    if (!result_email.success) {
      req.response = { errors: { root: 'Invalid Credentials' } };

      return next();
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      req.response = { errors: { root: 'Invalid Credentials' } };

      return next();
    }

    // Comparing password in db and the given one.
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
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
    await user.update({ refreshToken });

    // Sending tokens to client.
    res.cookie('yapper.refreshToken', refreshToken, {
      httpOnly: true,
      secure: req.app.locals.isProd,
      sameSite: 'Strict',
      maxAge: 1_000 * 60 * 60 * 24 * 30, // 30 days
    });

    req.response = { data: { accessToken } };

    next();
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    // Checking if the cookie exists.
    const refreshToken = req?.cookies?.['yapper.refreshToken'];
    if (!refreshToken) {
      req.response = { errors: { root: 'Invalid Request' } };

      return next();
    }

    // Validating the jwt token.
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

    // Comparing the cookie token with the on in the db.
    const user = await User.findByPk(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      req.response = { errors: { root: 'Invalid Request' } };

      res.clearCookie('yapper.refreshToken', {
        httpOnly: true,
        secure: req.app.locals.isProd,
        sameSite: 'Strict',
      });

      return next();
    }

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });

    req.response = { data: { accessToken } };

    next();
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req?.cookies?.['yapper.refreshToken'];

    if (refreshToken) await User.update({ refreshToken: null }, { where: { refreshToken } });

    res.clearCookie('yapper.refreshToken', {
      httpOnly: true,
      secure: req.app.locals.isProd,
      sameSite: 'Strict',
    });

    next();
  } catch (error) {
    next(error);
  }
}

export { login, refresh, logout };
