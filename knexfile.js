const config = require("./config/config");

const options = {
    client: 'mysql',
    connection: {
        host: config.database.HOST,
        user: config.database.USER,
        password: config.database.PASSWORD,
        database: config.database.DB
    },
    migrations: {
        directory: './migrations'
    }
}

module.exports = require("knex")(options);
