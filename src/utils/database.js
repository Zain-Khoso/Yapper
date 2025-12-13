// Lib Imports.
const Sequelize = require('sequelize');

// Environment Variables.
const DATABASE_URL = process.env.DATABASE_URL;

// Initializing Sequelize as the ORM for MySQL Database.
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

module.exports = sequelize;
