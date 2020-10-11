const Sequelize = require('sequelize');
const connection = require('./connection.json');

const sequelize = new Sequelize({
  database: connection.database,
  username: connection.user,
  host: connection.host,
  port: connection.port,
  password: connection.password,
  dialect: 'postgres',
  operatorsAliases: false
});

module.exports.sequelize = sequelize;