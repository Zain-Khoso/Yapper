// Loading Environment Variables.
import 'dotenv/config';

// Node Imports.
import path from 'path';

// Lib Imports.
import express from 'express';
import cookieParser from 'cookie-parser';

// Local Imports.
import { viteAssets } from './src/utils/helpers.js';
import sequelize from './src/utils/database.js';
import pageRouter from './src/routes/page.routes.js';
import apiRouter from './src/routes/api.routes.js';

// Initializing Express.
const app = express();

// Integrating Template Engine (Pug).
app.set('view engine', 'pug');
app.set('views', path.join(import.meta.dirname, 'src', 'views'));

// Setting Local Values. ( For templates mostly )
app.locals.isProd = app.get('env') === 'production';

// If the app is in PRODUCTION then serve the public dir statically.
if (app.locals.isProd) app.use(express.static(path.join(import.meta.dirname, 'public')));
// If not, hand the static assets logic over to Vite.
else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    appType: 'custom',
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);
}

// Integrating Middlewares.
app.use(cookieParser());
app.use(express.json());
app.use(viteAssets());

// Routes.
app.use('/api/v1/', apiRouter);
app.use(pageRouter);

// Defining Model Associations.
import './src/utils/associations.js';

// Connecting to Database.
await sequelize.sync({ force: false });

// Running the server.
app.listen(process.env.PORT);
