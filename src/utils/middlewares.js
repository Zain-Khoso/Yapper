// Node Imports.
import fs from 'fs';
import path from 'path';

// Middleware for protecting routes from already signed in users.
export function protectFromAuthenticatedUsers(req, res, next) {
  const isAuthenticated = req?.session?.isAuthenticated;

  if (req.method === 'GET') {
    if (!isAuthenticated) next();
    else res.redirect('/chat');
  } else {
    if (!isAuthenticated) next();
    else res.status(401).json({ errors: { root: 'Invalid Request.' } });
  }
}

// Middleware for protecting routes from non-signed in users.
export function protectFromUnAuthenticatedUsers(req, res, next) {
  const isAuthenticated = req?.session?.isAuthenticated;

  if (req.method === 'GET') {
    if (isAuthenticated) next();
    else res.redirect('/login');
  } else {
    if (isAuthenticated) next();
    else res.status(401).json({ errors: { root: 'Invalid Request.' } });
  }
}

// Middleware for getting assets' paths accordingly to the environment.
export function viteAssets() {
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
