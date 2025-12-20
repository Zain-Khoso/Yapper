// Node Imports.
import fs from 'fs';
import path from 'path';

// Lib Imports.
import jwt from 'jsonwebtoken';

// Local Imports.
import User from '../models/user.model.js';

// Middleware for getting assets' paths accordingly to the environment.
function viteAssets() {
  const isProd = process.env.NODE_ENV === 'production';
  let manifest = {};

  if (isProd) {
    const manifestPath = path.resolve(import.meta.dirname, 'public', '.vite', 'manifest.json');

    if (fs.existsSync(manifestPath)) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }

  return function (_, res, next) {
    res.locals.getAssets = function (entryName) {
      const entryPath = `src/client/pages/${entryName}.js`;

      if (!isProd) {
        return {
          js: `/${entryPath}`,
          css: [],
        };
      }

      // Production Mode
      const rootChunk = manifest[entryPath];
      if (!rootChunk) return { js: '', css: [] };

      const cssSet = new Set();

      // Recursive helper to find CSS in the current chunk and all its imports
      const collectAssets = (chunk) => {
        if (!chunk) return;

        if (chunk.css) chunk.css.forEach((cssFile) => cssSet.add(`/${cssFile}`));

        if (chunk.imports)
          chunk.imports.forEach((importKey) => {
            collectAssets(manifest[importKey]);
          });
      };

      // Start collection from the entry point
      collectAssets(rootChunk);

      return {
        js: `/${rootChunk.file}`,
        css: Array.from(cssSet),
      };
    };

    next();
  };
}

// Middleware for protecting routes from non-signed in users.
async function allowAuthenticatedUserOnly(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { root: 'Invalid Request' }, data: {} });
    }

    let userId = null;
    const token = authHeader.split(' ').at(-1);

    try {
      const tokenData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      userId = tokenData.userId;
    } catch (error) {
      return res.status(403).json({ success: false, errors: { root: 'Invalid Token.' }, data: {} });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.clearCookie('yapper.refreshToken', {
        httpOnly: true,
        secure: req.app.locals.isProd,
        sameSite: 'Strict',
      });

      return res.status(403).json({ success: false, errors: { root: 'Invalid Token.' }, data: {} });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export { viteAssets, allowAuthenticatedUserOnly };
