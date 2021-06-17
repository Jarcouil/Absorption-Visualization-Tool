const knex = require('../knex');

module.exports = {
    delete_measurement_data_table,
    delete_measurement_from_measurements,
    get_all_columns_of_measurement,
    get_all_timestamps_of_wavelength,
    get_all_ids_of_measurement,
    get_all_measurements,
    get_all_wavelengths_of_id,
    get_measurement,
    get_measurement_data,
    get_table_name_of_id,
    get_all_measurements_of_user,
    delete_all_measurements
}

function get_all_measurements(sort, order) {
    return knex.from('measurements')
        .innerJoin('users', 'measurements.created_by', 'users.id')
        .select('users.username', 'measurements.id', 'measurements.name', 'measurements.description', 'measurements.created_at AS createdAt', 'measurements.created_by as createdBy',)
        .orderBy(sort, order)
}

function get_all_measurements_of_user(userId, sort, order) {
    return knex.from('measurements')
        .innerJoin('users', 'measurements.created_by', 'users.id')
        .select('users.username', 'measurements.id', 'measurements.name', 'measurements.description', 'measurements.created_at AS createdAt', 'measurements.created_by as createdBy',)
        .where('users.id', userId)
        .orderBy(sort, order)
}

function get_table_name_of_id(id) {
    return knex.from('measurements')
        .select('name')
        .where('id', id)
}

function delete_measurement_from_measurements(id) {
    return knex.from('measurements')
        .where('id', id)
        .del()
}

function delete_all_measurements() {
    return knex.from('measurements')
        .del()
}

function delete_measurement_data_table(tableName) {
    return knex.schema.dropTableIfExists(tableName)
}

function get_measurement(id) {
    return knex.from('measurements')
        .select('*')
        .where('id', id)
}

function get_all_timestamps_of_wavelength(tableName, columns) {
    return knex.from(tableName)
        .select('id', `${columns} as wavelength`)
}

function get_all_wavelengths_of_id(tableName, id) {
    return knex.from(tableName)
        .select('*')
        .where('id', id)
}

function get_all_columns_of_measurement(tableName) {
    return knex.from('information_schema.columns')
        .select('COLUMN_NAME AS columns')
        .where('table_name', tableName)
}

function get_all_ids_of_measurement(tableName) {
    return knex.from(tableName)
        .select('id')
}

function get_measurement_data(tableName) {
    return knex.from(tableName)
        .select('*')
}
