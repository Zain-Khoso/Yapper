const fs = require('fs');
const path = require('path');

// Lib Imports.
const { defineConfig } = require('vite');

// Utility to make an object of entry point js files.
const entries = fs.readdirSync(path.join(__dirname, 'client', 'pages')).reduce((entries, file) => {
  const fileName = path.parse(file).name;

  entries[fileName] = path.resolve(__dirname, 'client', 'pages', file);

  return entries;
}, {});

// Vite Config Definition.
module.exports = defineConfig({
  server: {
    hmr: { protocol: 'ws', host: 'localhost' },
    middlewareMode: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: entries,
    },
  },
});
