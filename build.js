// Lib Imports.
const { execSync } = require('child_process');
const esbuild = require('esbuild');
const fs = require('fs-extra');

// Bundling the entrire codebase. Step-by-Step.
(async function () {
  console.log('\n1. Cleaning dist...');

  await fs.emptyDir('dist');

  console.log('\n2. Bundling Frontend (Vite)...\n');

  execSync('pnpm dlx vite build', { stdio: 'inherit' });

  console.log('\n3. Moving Views...');

  await fs.copy('src/views', 'dist/src/views');

  console.log('\n4. Bundling Backend (esbuild)...');

  await esbuild.build({
    entryPoints: ['app.js'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: 'dist/app.js',
    packages: 'external',
    format: 'cjs',
    minify: true,
    sourcemap: true,
  });

  console.log('\n✅ Build complete.');
})();
