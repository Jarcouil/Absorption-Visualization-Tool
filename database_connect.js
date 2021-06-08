var mysql = require('mysql');
const config = require("./config/config");

var connection = mysql.createConnection({
  host: config.database.HOST,
  user: config.database.USER,
  password: config.database.PASSWORD,
  database: config.database.DB
})

connection.connect();

module.exports = connection;
