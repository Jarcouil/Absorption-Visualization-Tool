const config = require("./config/config");

const options = {
    client: 'mysql2',
    connection: {
        host: config.database.HOST,
        user: config.database.USER,
        password: config.database.PASSWORD,
        database: config.database.DB
    },
    migrations: {
        tableName: "knex_migrations",
        directory: './migrations'
    },
    seeds: {
        tableName: "knex_seeds",
        directory: './seeds'
    }
}

module.exports = options;

const { attachPaginate } = require('knex-paginate');
attachPaginate();
