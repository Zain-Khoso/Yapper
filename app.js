// Loading Environment Variables.
require('dotenv').config({ quiet: true });

// Node Imports.
const path = require('path');

// Lib Imports.
const express = require('express');

// Local Imports.
const sequelize = require('./src/utils/database');
const { getNotFoundPage, getServerErrorPage } = require('./src/controllers/static.controller');
const staticRouter = require('./src/routes/static.routes');
const authRouter = require('./src/routes/auth.routes');
const chatRouter = require('./src/routes/chat.routes');
const settingsRouter = require('./src/routes/settings.routes');

// Initializing Express.
const app = express();

// Integrating Template Engine (Pug).
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src', 'views'));

// Exposing the Public Directory
app.use(express.static(path.join(__dirname, 'public')));

// Integrating Middlewares.
app.use(express.json());

// Routes.
app.use(staticRouter, authRouter, chatRouter);
app.use('/settings', settingsRouter);

// Error Middlewares.
app.use(getNotFoundPage);
app.use(getServerErrorPage);

// Running the server.
sequelize
  .sync({ force: false })
  .then(() => app.listen(process.env.PORT))
  .catch((error) => console.log(error));
