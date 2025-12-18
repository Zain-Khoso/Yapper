// Lib Imports.
import { execSync } from 'child_process';
import esbuild from 'esbuild';
import fs from 'fs-extra';

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
  format: 'esm',
  minify: true,
  sourcemap: true,
  banner: {
    // This allows top-level await to work correctly in some Node environments
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});

console.log('\n✅ Build complete.');
