// Lib Imports.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Util Imports.
import { schema_Email } from '../utils/validations.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  removeRefreshTokenCookie,
} from '../utils/auth.utils.js';

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

    const user = await User.scope('full').findOne({ where: { email } });
    if (!user) {
      req.response = { errors: { root: 'Invalid Credentials' } };
      return next();
    }

    // Comparing password in db and the given one.
    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      req.response = { errors: { root: 'Invalid Credentials.' } };
      return next();
    }

    // Generating Access and Refresh tokens.
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Storing the refreshToken in db.
    await user.update({ refreshToken });

    // Sending tokens to client.
    setRefreshTokenCookie(res, refreshToken);

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
      removeRefreshTokenCookie(res);

      req.response = { errors: { root: 'Invalid Request' } };

      return next();
    }

    // Comparing the cookie token with the on in the db.
    const user = await User.scope('full').findByPk(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      removeRefreshTokenCookie(res);

      req.response = { errors: { root: 'Invalid Request' } };
      return next();
    }

    const accessToken = generateAccessToken(user.id);

    req.response = { data: { accessToken } };
    next();
  } catch (error) {
    removeRefreshTokenCookie(res);

    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = req?.cookies?.['yapper.refreshToken'];

    if (refreshToken) await User.update({ refreshToken: null }, { where: { refreshToken } });

    removeRefreshTokenCookie(res);

    next();
  } catch (error) {
    next(error);
  }
}

export { login, refresh, logout };
