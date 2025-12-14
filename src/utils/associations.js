// Local Imports.
const User = require('../models/user.model');
const Chatroom = require('../models/chatroom.model');
const ChatroomMember = require('../models/chatroomMember.model');
const Message = require('../models/message.model');

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
