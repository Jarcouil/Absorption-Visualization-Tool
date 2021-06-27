exports.up = function (knex) {
    return knex.schema
        .createTable('users', (table) => {
            table.increments('id')
            table.string('username').notNullable()
            table.string('email').notNullable()
            table.string('password').notNullable()
            table.integer('is_admin', 0)
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
        })
        .createTable('measurements', (table) => {
            table.increments('id')
            table.string('name').notNullable()
            table.string('description').notNullable()
            table.integer('created_by').unsigned().notNullable().references('id').inTable('users')
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
        })
        .createTable('reset_token', (table) => {
            table.increments('id')
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users')
            table.string('reset_token').notNullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
        })
}

exports.down = function (knex) {
    return knex.schema.dropTable('measurements').dropTable('reset_token').dropTable('users')
}