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
async function allowAuthenticatedUserOnly(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json(serializeResponse({}, { root: 'Invalid Request.' }));
  }

  let decoded = null;
  const token = authHeader.split(' ').at(-1);

  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    return res.status(403).json(serializeResponse({}, { root: 'Invalid Request.' }));
  }

  const user = await User.scope('full').findByPk(decoded.userId);
  if (!user) {
    removeRefreshTokenCookie(res);
    return res.status(401).json(serializeResponse({}, { root: 'Invalid Request.' }));
  }

  req.user = user;
  next();
}

// Middleware for protecting routes from authenticated users.
async function allowNonAuthenticatedUserOnly(req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ').at(-1);

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    return res.status(400).json(serializeResponse({}, { root: 'Invalid Request' }));
  } catch (error) {
    return next();
  }
}

async function protectRoute(req, res, next) {
  try {
    const refreshToken = req.cookies['yapper.refreshToken'];
    if (!refreshToken) return res.redirect('/login');

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.scope('full').findByPk(decodedRefresh.userId);

      if (!user || user.refreshToken !== refreshToken) throw new Error();

      return next();
    } catch (err) {
      return res.redirect('/login');
    }
  } catch (error) {
    removeRefreshTokenCookie(res);
    return res.redirect('/login');
  }
}

async function redirectIfAuthenticated(req, res, next) {
  const refreshToken = req.cookies['yapper.refreshToken'];
  if (!refreshToken) return next();
  console.log('Hello World');
  try {
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.scope('full').findByPk(decodedRefresh.userId);

    if (!user || user.refreshToken !== refreshToken) throw new Error();

    return res.redirect('/chat');
  } catch (error) {
    return next();
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  removeRefreshTokenCookie,
  allowAuthenticatedUserOnly,
  allowNonAuthenticatedUserOnly,
  protectRoute,
  redirectIfAuthenticated,
};
