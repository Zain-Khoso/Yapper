// THIS FILE SHOULD NEVER BE IMPORTED INTO ANY MAIN PROJECT FILE.
// AND ALWAYS SHOULD BE RUN SEPARATELY VIA NODE IN CMD.
require('dotenv').config({ quiet: true });

// Lib Imports.
const { genSaltSync, hashSync } = require('bcrypt');

// Local Imports.
const sequelize = require('./database');
const User = require('../models/user.model');
const Chatroom = require('../models/chatroom.model');

// Constants.
const USERS_TO_BE_CREATED = 100;

const USER_EMAIL = 'testuser@gmail.com';
const USER_NAME = 'Test User';
const USER_PASSWORD = hashSync('aA#12345', genSaltSync(parseInt(process.env.PASSWORD_SALT)));
const users = [{ email: USER_EMAIL, displayName: USER_NAME, password: USER_PASSWORD }];
const messages = [];

// DATA SEEDS.

// User Data Seed.
do {
  const userNumber = users.length;
  const email = `testuser${userNumber}@gmail.com`;
  const displayName = `Test User ${userNumber}`;

  users.push({ email, displayName, password: USER_PASSWORD });
  messages.push(userNumber.toString());
} while (users.length < USERS_TO_BE_CREATED);

// Associations.
require('./associations');

// Data syncing.
sequelize
  .sync({ force: true })
  .then(() => User.bulkCreate(users))
  .then((users) => {
    console.log(`\nUsers Created: ${users.length}.\n`);

    return Promise.all([User.findOne({ where: { email: USER_EMAIL } }), users]);
  })
  .then(([user, users]) =>
    Promise.all(
      users.map((u) => {
        if (u.email === user.email) return null;
        return Chatroom.create()
          .then((chatroom) => Promise.all([chatroom, chatroom.addUsers([user, u])]))
          .then(([chatroom, chatroomMembers]) =>
            Promise.all(
              messages.map((text) =>
                chatroom.createMessage({
                  senderId: user.id,
                  content: text,
                  chatroomMemberId: chatroomMembers.find((crm) => crm.UserId === user.id).id,
                })
              )
            )
          );
      })
    )
  )
  .then((chatrooms) => console.log(`\nChatrooms Created: ${chatrooms.length}.\n`))
  .then(() => process.exit())
  .catch((error) => console.log(error));
