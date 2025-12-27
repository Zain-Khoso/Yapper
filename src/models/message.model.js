// Lib Imports.
import { DataTypes } from 'sequelize';

// Local Imports.
import sequelize from '../utils/database.js';
import { MAX_FILE_NAME_LENGTH } from '../utils/validations.js';

// This model is used to store the information related to a specific message.
const Message = sequelize.define('message', {
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
    type: DataTypes.STRING(MAX_FILE_NAME_LENGTH),
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

export default Message;
