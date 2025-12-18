// Node Imports.
import path from 'path';

// Lib Imports.
import { configDotenv } from 'dotenv';
import express from 'express';

// Loading Environment Variables.
configDotenv({ quiet: true });

// Middleware Imports.
import { viteAssets } from './src/utils/middlewares.js';

// Routes & Controllers.
import pageRouter from './src/routes/page.routes.js';
import { getNotFoundPage } from './src/controllers/page.controller.js';

// Initializing Express.
const app = express();

// Integrating Template Engine (Pug).
app.set('view engine', 'pug');
app.set('views', path.join(import.meta.dirname, 'src', 'views'));

// Setting Local Values. ( For templates mostly )
app.locals.isProd = app.get('env') === 'production';

// If the app is in PRODUCTION then serve the public dir statically.
if (app.locals.isProd) app.use(express.static(path.join(import.meta.dirname, 'public')));
// If not, handle the static assets logic over to Vite.
else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    appType: 'custom',
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);
}

// Integrating Middlewares.
app.use(express.json());
app.use(viteAssets());

// Routes.
app.use(pageRouter);

// Error Middlewares.
app.use(getNotFoundPage);

// Running the server.
app.listen(process.env.PORT);
