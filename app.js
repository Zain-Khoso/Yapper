// Loading Environment Variables.
import 'dotenv/config';

// Node Imports.
import {createServer} from 'http';
import path from 'path';

// Lib Imports.
import express from 'express';
import {Server as SocketServer} from 'socket.io'
import cookieParser from 'cookie-parser';
import CORS from 'cors';

// Local Imports.
import { viteAssets } from './src/utils/helpers.js';
import sequelize from './src/utils/database.js';
import pageRouter from './src/routes/page.routes.js';
import apiRouter from './src/routes/api.routes.js';
import { stripeWebhook } from './src/controllers/payment.controller.js';

// Initializing HTTP server and Web-sockets server.
const app = express();
const server = createServer(app);
const io = new SocketServer(server);

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
app.use(
  CORS({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(cookieParser());
app.use(express.json());
app.use(viteAssets());

// Routes.
app.use('/api/v1/', apiRouter);
app.use(pageRouter);

// Defining Model Associations.
import './src/utils/associations.js';

// Cron Jobs.
import './src/utils/cron-jobs.js';

// Connecting to Database.
await sequelize.sync({ force: false });

// Web-sockets Events.
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });});

// Running the server.
server.listen(process.env.PORT);
