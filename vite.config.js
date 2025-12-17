// Node Imports.
const fs = require('fs');
const path = require('path');

// Lib Imports.
const { defineConfig } = require('vite');

// Utility to make an object of entry point js files.
const entries = fs
  .readdirSync(path.join(__dirname, 'src', 'client', 'pages'))
  .reduce((entries, file) => {
    const fileName = path.parse(file).name;

    entries[fileName] = path.resolve(__dirname, 'src', 'client', 'pages', file);

    return entries;
  }, {});

// Vite Config Definition.
module.exports = defineConfig({
  publicDir: path.join(__dirname, 'public'),
  server: {
    hmr: { protocol: 'ws', host: 'localhost' },
    middlewareMode: true,
  },
  build: {
    outDir: path.join(__dirname, 'dist', 'public'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: entries,
    },
  },
});
