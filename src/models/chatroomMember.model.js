// Lib Imports.
import { DataTypes } from 'sequelize';

// Local Imports.
import sequelize from '../utils/database.js';

// This model is used to store the information related to a user inside a specifically chatroom.
const ChatroomMember = sequelize.define('chatroomMember', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4(),
  },

  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  lastReadAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(),
  },
});

export default ChatroomMember;
