// Lib Imports.
const Sequelize = require('sequelize');

// Environment Variables.
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_PORT = process.env.DATABASE_PORT;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_NAME = process.env.DATABASE_NAME;

// Initializing Sequelize as the ORM for MySQL Database.
const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
  dialect: 'mysql',
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  logging: false,
});

module.exports = sequelize;
