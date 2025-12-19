// Lib Imports.
import { DataTypes } from 'sequelize';

// Local Imports.
import sequelize from '../utils/database.js';

// This model is used to store temporary user info during signup process.
const Registration = sequelize.define('registration', {
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

  otp: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },

  otpExpires: {
    type: DataTypes.DATE,
    allowNull: false,
    unique: false,
    defaultValue: () => new Date(Date.now() + 1_000 * 60 * 5), // 5 minutes.
  },

  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    unique: false,
    defaultValue: false,
  },
});

export default Registration;
