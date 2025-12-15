// Loading Environment Variables.
require('dotenv').config({ quiet: true });

// Node Imports.
const path = require('path');

// Lib Imports.
const express = require('express');
const session = require('express-session');
const SequelizeSessionStore = require('connect-session-sequelize')(session.Store);

// Local Imports.
const sequelize = require('./src/utils/database');
const { getNotFoundPage } = require('./src/controllers/page.controller');
const pageRouter = require('./src/routes/page.routes');
const authRouter = require('./src/routes/auth.routes');
const chatRouter = require('./src/routes/chat.routes');

// Initializing Express.
const app = express();

// Integrating Template Engine (Pug).
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('trust proxy', app.get('env') === 'production' ? 1 : 0);

// Exposing the Public Directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    name: 'yapper.session',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SequelizeSessionStore({
      db: sequelize,
    }),
    cookie: {
      secure: app.get('env') === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 Days.
    },
  })
);

// Integrating Middlewares.
app.use(express.json());

// Routes.
app.use(pageRouter);
app.use('/api/v1/', authRouter, chatRouter);

// Error Middlewares.
app.use(getNotFoundPage);

// Model Associations.
require('./src/utils/associations');

// Running the server.
sequelize
  .sync({ force: false })
  .then(() => app.listen(process.env.PORT))
  .catch((error) => console.log(error));
