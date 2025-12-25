// THIS FILE SHOULD NEVER BE IMPORTED INTO ANY MAIN PROJECT FILE.
// AND ALWAYS SHOULD BE RUN SEPARATELY VIA NODE IN CMD.
import 'dotenv/config';

// Lib Imports.
import bcrypt from 'bcrypt';

// Local Imports.
import sequelize from './database.js';
import User from '../models/user.model.js';
import Chatroom from '../models/chatroom.model.js';

// Constants.
const USERS_TO_BE_CREATED = 100;

const USER_EMAIL = 'testuser@gmail.com';
const USER_NAME = 'Test User';
const USER_PASSWORD = bcrypt.hashSync(
  'aA#12345',
  bcrypt.genSaltSync(parseInt(process.env.PASSWORD_SALT))
);
const usersList = [{ email: USER_EMAIL, displayName: USER_NAME, password: USER_PASSWORD }];

// DATA SEEDS.

// User Data Seed.
do {
  const userNumber = usersList.length;
  const email = `testuser${userNumber}@gmail.com`;
  const displayName = `Test User ${userNumber}`;

  usersList.push({ email, displayName, password: USER_PASSWORD });
} while (usersList.length < USERS_TO_BE_CREATED);

// Associations.
import './associations.js';

// Data syncing.
await sequelize.sync({ force: true });

// Creating Users.
const users = await User.bulkCreate(usersList);
console.log(`\nUsers Created: ${users.length}.\n`);

const user = await User.findOne({ where: { email: USER_EMAIL } });
const chatrooms = [];

// Creating Chatrooms.
for (const u of users) {
  if (u.id === user.id) continue;

  const chatroom = await Chatroom.create();
  await chatroom.addMembers([user, u]);

  chatrooms.push(chatroom);
}

console.log(`\nChatrooms Created: ${chatrooms.length}.\n`);

process.exit();
