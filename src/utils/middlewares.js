// Node Imports.
const fs = require('fs');
const path = require('path');

// Middleware for protecting routes from already signed in users.
exports.protectFromAuthenticatedUsers = function (req, res, next) {
  const isAuthenticated = req?.session?.isAuthenticated;

  if (req.method === 'GET') {
    if (!isAuthenticated) next();
    else res.redirect('/chat');
  } else {
    if (!isAuthenticated) next();
    else res.status(401).json({ errors: { root: 'Invalid Request.' } });
  }
};

// Middleware for protecting routes from non-signed in users.
exports.protectFromUnAuthenticatedUsers = function (req, res, next) {
  const isAuthenticated = req?.session?.isAuthenticated;

  if (req.method === 'GET') {
    if (isAuthenticated) next();
    else res.redirect('/login');
  } else {
    if (isAuthenticated) next();
    else res.status(401).json({ errors: { root: 'Invalid Request.' } });
  }
};

// Middleware for getting assets' paths accordingly to the environment.
exports.viteAssets = function () {
  const isProd = process.env.NODE_ENV === 'production';
  let manifest = {};

  if (isProd) {
    const manifestPath = path.resolve(__dirname, 'public', '.vite', 'manifest.json');

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
};
