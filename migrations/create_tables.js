var bcrypt = require("bcryptjs");

const users = [
    {
        username: 'admin',
        password: bcrypt.hashSync('password', 8),
        email: 'admin@example.com',
        is_admin: 1
    },
    {
        username: 'user',
        password: bcrypt.hashSync('password', 8),
        email: 'user@example.com',
        is_admin: 1
    }
]

exports.up = function (knex) {
    return knex.schema
        .dropTableIfExists("users")
        .createTable('users', (table) => {
            table.increments('id')
            table.string('username').notNullable()
            table.string('email').notNullable()
            table.string('password').notNullable()
            table.integer('is_admin', 0)
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
        })
        .dropTableIfExists("measurements")
        .createTable('measurements', (table) => {
            table.increments('id')
            table.string('name').notNullable()
            table.string('description').notNullable()
            table.integer('created_by').unsigned().notNullable().references('id').inTable('users')
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
        })
        .dropTableIfExists("reset_token")
        .createTable('reset_token', (table) => {
            table.increments('id')
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
            table.string('reset_token').notNullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
        }).then(() => {
            knex('users').insert(users).then(() => console.log("data inserted"))
                .catch((err) => { console.log(err); throw err })
                .finally(() => {
                    knex.destroy();
                });
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('measurements').dropTable('users').dropTable('reset_token')
}