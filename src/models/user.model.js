// Lib Imports.
import { DataTypes } from 'sequelize';

// Local Imports.
import sequelize from '../utils/database.js';

// This model is used to store the information related specifically to a user.
const User = sequelize.define(
  'user',
  {
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

    picture: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
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

    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(),
    },

    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      unique: false,
    },

    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      unique: false,
    },

    otpAction: {
      type: DataTypes.ENUM('email-change', 'password-change', 'account-delete'),
      allowNull: true,
      unique: false,
    },

    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
  },
  {
    defaultScope: {
      attributes: { exclude: ['password', 'otp', 'otpExpires', 'otpAction', 'refreshToken'] },
    },

    scopes: {
      full: {
        attributes: { exclude: [] },
      },
    },
  }
);

export default User;
