// Lib Imports.
import jwt from 'jsonwebtoken';

// Local Imports.
import User from '../models/user.model.js';
import { serializeResponse } from './serializers.js';

// Constants.
const COOKIE_NAME = 'yapper.refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
};
const COOKIE_MAX_AGE = 1_000 * 60 * 60 * 24 * 30; // 30 days
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Functions.

function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
}

function setRefreshTokenCookie(res, refreshToken) {
  res.cookie(COOKIE_NAME, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: COOKIE_MAX_AGE,
  });
}

function removeRefreshTokenCookie(res) {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

// Middleware for protecting routes from unauthenticated users.
async function allowAuthenticatedUserOnly(req, res) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(serializeResponse({}, { root: 'Invalid Request.' }));
  }

  let decoded = null;
  const token = authHeader.split(' ').at(-1);

  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return res.status(403).json(serializeResponse({}, { root: 'Invalid Request.' }));
  }

  const user = await User.findByPk(decoded.userId);
  if (!user) {
    removeRefreshTokenCookie(res);
    return res.status(401).json(serializeResponse({}, { root: 'Invalid Request.' }));
  }

  req.user = user;
  next();
}

export {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  removeRefreshTokenCookie,
  allowAuthenticatedUserOnly,
};
