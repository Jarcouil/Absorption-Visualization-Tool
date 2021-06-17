const config = require("./config/config");

const connection = {
    host: config.database.HOST,
    user: config.database.USER,
    password: config.database.PASSWORD,
    database: config.database.DB
}

const knex = require('knex')({
    client: 'mysql',
    connection: connection
});

module.exports = knex;
