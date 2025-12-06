// Lib Imports.
const { DataTypes } = require('sequelize');

// Local Imports.
const sequelize = require('../utils/database');

// This model is used to store the information related specifically to a user.
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4(),
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  displayName: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: false,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },

  actionToken: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  actionTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true,
    unique: true,
  },
});

module.exports = User;
