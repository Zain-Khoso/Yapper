// Loading Environment Variables.
require('dotenv').config({ quiet: true });

// Node Imports.
const path = require('path');

// Lib Imports.
const express = require('express');

// Local Imports.
const { getNotFoundPage, getServerErrorPage } = require('./src/controllers/static');
const staticRouter = require('./src/routes/static');
const authRouter = require('./src/routes/auth');
const chatRouter = require('./src/routes/chat');

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

// Error Middlewares.
app.use(getNotFoundPage);
app.use(getServerErrorPage);

// Running the server.
app.listen(process.env.PORT);
