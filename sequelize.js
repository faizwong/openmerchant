const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

const config = require('./config.js');

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

const dbConfig = config[NODE_ENV].db;

const sequelize = new Sequelize(dbConfig.url, dbConfig.options);

module.exports = sequelize;
