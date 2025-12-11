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
const { getNotFoundPage, getServerErrorPage } = require('./src/controllers/static.controller');
const staticRouter = require('./src/routes/static.routes');
const authRouter = require('./src/routes/auth.routes');
const chatRouter = require('./src/routes/chat.routes');
const settingsRouter = require('./src/routes/settings.routes');
const { protectFromUnAuthenticatedUsers } = require('./src/utils/middlewares');
const User = require('./src/models/user.model');
const Chatroom = require('./src/models/chatroom.model');
const ChatroomMember = require('./src/models/chatroomMember.model');
const Message = require('./src/models/message.model');

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
app.use(staticRouter, authRouter, chatRouter);
app.use('/chat', protectFromUnAuthenticatedUsers, chatRouter);
app.use('/settings', settingsRouter);

// Error Middlewares.
app.use(getNotFoundPage);
app.use(getServerErrorPage);

// Model Associations.
User.belongsToMany(Chatroom, { through: ChatroomMember });
Chatroom.belongsToMany(User, { through: ChatroomMember });

Chatroom.hasMany(Message, {
  foreignKey: 'roomId',
  onDelete: 'CASCADE',
});
Message.belongsTo(Chatroom, {
  foreignKey: 'roomId',
  onDelete: 'CASCADE',
});

User.hasMany(Message, {
  foreignKey: 'senderId',
  onDelete: 'SET NULL',
});
Message.belongsTo(User, {
  foreignKey: 'senderId',
  onDelete: 'SET NULL',
});

ChatroomMember.hasMany(Message, {
  foreignKey: 'chatroomMemberId',
  onDelete: 'SET NULL',
});
Message.belongsTo(ChatroomMember, {
  foreignKey: 'chatroomMemberId',
  onDelete: 'SET NULL',
});

// Running the server.
sequelize
  .sync({ force: false })
  .then(() => app.listen(process.env.PORT))
  .catch((error) => console.log(error));
