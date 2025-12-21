// Lib Imports.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Util Imports.
import { schema_Email, schema_String } from '../utils/validations.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  removeRefreshTokenCookie,
} from '../utils/auth.utils.js';
import { serializeResponse } from '../utils/serializers.js';
import { sanitizeEmail } from '../utils/sanitizers.js';

// Model Imports.
import User from '../models/user.model.js';

async function login(req, res) {
  // Working body.
  let { email, password } = req.body;
  email = sanitizeEmail(email);
  const result_email = schema_Email.safeParse(email);
  const result_password = schema_String.safeParse(password);

  if (!result_email.success || !result_password.success) {
    return res.status(409).json(serializeResponse({}, { root: 'Invalid Credentials' }));
  }

  const user = await User.scope('full').findOne({ where: { email } });
  if (!user) {
    return res.status(409).json(serializeResponse({}, { root: 'Invalid Credentials' }));
  }

  // Comparing password in db and the given one.
  const passwordsMatch = await bcrypt.compare(password, user.password);
  if (!passwordsMatch) {
    return res.status(409).json(serializeResponse({}, { root: 'Invalid Credentials' }));
  }

  // Generating Access and Refresh tokens.
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Storing the refreshToken in db.
  await user.update({ refreshToken });

  // Sending tokens to client.
  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json(serializeResponse({ accessToken }));
}

async function refresh(req, res, next) {
  try {
    // Checking if the cookie exists.
    const refreshToken = req?.cookies?.['yapper.refreshToken'];
    if (!refreshToken) {
      return res.status(401).json(serializeResponse({}, { root: 'Invalid Request' }));
    }

    // Validating the jwt token.
    let decoded = null;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      removeRefreshTokenCookie(res);

      return res.status(401).json(serializeResponse({}, { root: 'Invalid Request' }));
    }

    // Comparing the cookie token with the on in the db.
    const user = await User.scope('full').findByPk(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      removeRefreshTokenCookie(res);

      return res.status(401).json(serializeResponse({}, { root: 'Invalid Request' }));
    }

    const accessToken = generateAccessToken(user.id);
    return res.status(200).json(serializeResponse({ accessToken }));
  } catch (error) {
    removeRefreshTokenCookie(res);

    next(error);
  }
}

async function logout(req, res) {
  const refreshToken = req?.cookies?.['yapper.refreshToken'];
  if (refreshToken) await User.update({ refreshToken: null }, { where: { refreshToken } });

  removeRefreshTokenCookie(res);

  return res.status(200).json(serializeResponse());
}

export { login, refresh, logout };
