// Loading Environment Variables.
require('dotenv').config({ quiet: true });

// Node Imports.
const path = require('path');

// Lib Imports.
const express = require('express');

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

// Running the server.
app.listen(process.env.PORT);
