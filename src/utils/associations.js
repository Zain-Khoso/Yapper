// Local Imports.
import User from '../models/user.model.js';
import Chatroom from '../models/chatroom.model.js';
import ChatroomMember from '../models/chatroomMember.model.js';
import Message from '../models/message.model.js';

// Model Associations.
User.belongsToMany(Chatroom, { through: ChatroomMember, as: 'member', foreignKey: 'memberId' });
Chatroom.belongsToMany(User, { through: ChatroomMember, as: 'room', foreignKey: 'roomId' });

User.hasMany(ChatroomMember, {
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});
ChatroomMember.belongsTo(User, {
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL',
});

Chatroom.hasMany(ChatroomMember, {
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});
ChatroomMember.belongsTo(Chatroom, {
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

Chatroom.hasMany(Message, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Message.belongsTo(Chatroom, { foreignKey: 'roomId', onDelete: 'CASCADE' });

User.hasMany(Message, { onDelete: 'SET NULL' });
Message.belongsTo(User, { onDelete: 'SET NULL' });

ChatroomMember.hasMany(Message, { foreignKey: 'senderId', onDelete: 'SET NULL' });
Message.belongsTo(ChatroomMember, { foreignKey: 'senderId', onDelete: 'SET NULL' });
