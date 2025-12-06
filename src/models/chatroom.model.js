// Lib Imports.
const { DataTypes } = require('sequelize');

// Local Imports.
const sequelize = require('../utils/database');

// This model is used to store the information related specifically to a chatroom.
const Chatroom = sequelize.define('Chatroom', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4(),
  },

  name: {
    type: DataTypes.STRING(16),
    allowNull: true,
  },

  isGroup: {
    type: DataTypes.BOOLEAN,
    default: false,
  },
});

module.exports = Chatroom;
