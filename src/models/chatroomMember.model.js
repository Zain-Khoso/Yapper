// Lib Imports.
const { DataTypes } = require('sequelize');

// Local Imports.
const sequelize = require('../utils/database');
const Chatroom = require('./chatroom.model');
const User = require('./user.model');

// This model is used to store the information related to a user inside a specifically chatroom.
const ChatroomMember = sequelize.define('ChatroomMember', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4(),
  },

  UserId: {
    type: DataTypes.STRING,
    references: {
      model: User,
      key: 'id',
    },
  },

  ChatroomId: {
    type: DataTypes.STRING,
    references: {
      model: Chatroom,
      key: 'id',
    },
  },

  blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  deletedAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(Date.now()),
  },
});

module.exports = ChatroomMember;
