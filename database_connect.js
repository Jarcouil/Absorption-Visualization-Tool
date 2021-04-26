var CONFIG = require('./config/db.config');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: CONFIG.HOST,
  user: CONFIG.USER,
  password: CONFIG.PASSWORD,
  database: CONFIG.DB
})

connection.connect();

module.exports = connection;
