// Loading Environment Variables.
require('dotenv').config({ quiet: true });

// Lib Imports.
const express = require('express');

// Initializing Express.
const app = express();

// Running the server.
app.listen(process.env.PORT);
