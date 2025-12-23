// Local Imports.
import User from '../models/user.model.js';
import Chatroom from '../models/chatroom.model.js';
import ChatroomMember from '../models/chatroomMember.model.js';
import Message from '../models/message.model.js';

// Model Associations.
User.belongsToMany(Chatroom, {
  through: ChatroomMember,
  as: 'rooms',
  foreignKey: 'memberId',
});
Chatroom.belongsToMany(User, {
  through: ChatroomMember,
  as: 'members',
  foreignKey: 'roomId',
});

User.hasMany(ChatroomMember, { foreignKey: 'memberId' });
ChatroomMember.belongsTo(User, { foreignKey: 'memberId' });

Chatroom.hasMany(ChatroomMember, { foreignKey: 'roomId' });
ChatroomMember.belongsTo(Chatroom, { foreignKey: 'roomId' });

Chatroom.hasMany(Message, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Message.belongsTo(Chatroom, { foreignKey: 'roomId' });

User.hasMany(Message, { foreignKey: 'userId', onDelete: 'SET NULL' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'sender' });

ChatroomMember.hasMany(Message, { foreignKey: 'senderId', onDelete: 'SET NULL' });
Message.belongsTo(ChatroomMember, { foreignKey: 'senderId', onDelete: 'SET NULL' });
