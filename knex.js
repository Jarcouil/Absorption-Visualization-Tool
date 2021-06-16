const config = require("./config/config");
var bcrypt = require("bcryptjs");

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
const users = [
    {
        username: 'admin',
        password: bcrypt.hashSync('password', 8),
        email: 'admin@example.com',
        is_admin: 1
    }
]

knex.schema.hasTable('measurements').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('measurements', (table) => {
            table.increments('id')
            table.string('name').notNullable()
            table.string('description').notNullable()
            table.integer('created_by').notNullable()
            table.timestamps()
        })
    }
}).then(() => {
    knex.schema.hasTable('users').then(function (exists) {
        if (!exists) {
            return knex.schema.createTable('users', (table) => {
                table.increments('id')
                table.string('username').notNullable()
                table.string('email').notNullable()
                table.string('password').notNullable()
                table.integer('is_admin', 0)
                table.timestamps()
            })
        }
    }).then(() => {
        knex('users').insert(users).then(() => console.log("data inserted"))
            .catch((err) => { console.log(err); throw err })
            .finally(() => {
                knex.destroy();
            });
    })
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
        });
})
    .catch((err) => { console.log(err); throw err })
    .finally(() => {
    });






module.exports = knex;
