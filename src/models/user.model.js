// Lib Imports.
const { DataTypes } = require('sequelize');

// Local Imports.
const sequelize = require('../utils/database');

// This is model is used to store the information related specifically to a user.
const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
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
});

module.exports = User;
