// Lib Imports.
import { DataTypes } from 'sequelize';

// Local Imports.
import sequelize from '../utils/database.js';

// This model is used to store the information related specifically to a chatroom.
const Chatroom = sequelize.define('chatroom', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4(),
  },

  lastMessageAt: {
    type: DataTypes.DATE,
    defaultValue: () => new Date(),
  },
});

export default Chatroom;
