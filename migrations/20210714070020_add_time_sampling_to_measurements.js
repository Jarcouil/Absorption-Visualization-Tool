
exports.up = function(knex) {
    return knex.schema.table('measurements', (table) => {
        table.integer('sampling_rate').notNullable()
    })
};

exports.down = function(knex) {
    return knex.schema.table('measurements', (table) => {
        table.dropTable('sampling_rate')
    })
};
