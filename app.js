// Loading Environment Variables.
require('dotenv').config({ quiet: true });

// Node Imports.
const path = require('path');

// Lib Imports.
const express = require('express');

// Local Imports.
const { getNotFoundPage } = require('./src/controllers/static');
const staticRouter = require('./src/routes/static');

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
app.use(staticRouter);

// Error Middlewares.
app.use(getNotFoundPage);

// Running the server.
app.listen(process.env.PORT);
