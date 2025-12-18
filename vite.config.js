// Node Imports.
import fs from 'fs';
import path from 'path';

// Lib Imports.
import { defineConfig } from 'vite';

// Utility to make an object of entry point js files.
const entries = fs
  .readdirSync(path.join(import.meta.dirname, 'src', 'client', 'pages'))
  .reduce((entries, file) => {
    const fileName = path.parse(file).name;

    entries[fileName] = path.resolve(import.meta.dirname, 'src', 'client', 'pages', file);

    return entries;
  }, {});

// Vite Config Definition.
export default defineConfig({
  publicDir: path.join(import.meta.dirname, 'public'),
  server: {
    hmr: { protocol: 'ws', host: 'localhost' },
    middlewareMode: true,
  },
  build: {
    outDir: path.join(import.meta.dirname, 'dist', 'public'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: entries,
    },
  },
});
