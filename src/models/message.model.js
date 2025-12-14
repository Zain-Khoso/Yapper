// Lib Imports.
const { DataTypes } = require('sequelize');

// Local Imports.
const sequelize = require('../utils/database');

// This model is used to store the information related to a specific message.
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4(),
  },

  isFile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  fileType: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },

  fileName: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },

  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

module.exports = Message;
