var CONFIG = require('./config.json');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: CONFIG.host,
  user: CONFIG.userName,
  password: CONFIG.password,
  database: CONFIG.database
})

connection.connect();

module.exports = connection;
