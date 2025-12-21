// Node Imports.
import fs from 'fs';
import path from 'path';

// Lib Imports.
import { generate } from 'otp-generator';

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

function generateOTP() {
  return generate(6, {
    digits: true,
    upperCaseAlphabets: true,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
}

export { viteAssets, generateOTP };
