const options = require('../knexfile');
const knex = require("knex")(options);

module.exports = {
    deleteMeasurementDataTable,
    deleteMeasurementFromMeasurements,
    getWavelengthsOfMeasurement,
    getTimestampsOfWavelength,
    getAllTimestampsOfMeasurement,
    getMeasurements,
    getWavelengthsOfTimestamp,
    getMeasurement,
    getMeasurementData,
    getMeasurementsOfUser,
    deleteAllMeasurements
};

/**
 * Get all measurements from the database
 * @param {string} sort 
 * @param {string} order
 * @returns array of measurements
 */
function getMeasurements(sort = 'id', order = 'asc', page = 1, perPage = 10) {
    return knex.from('measurements')
        .innerJoin('users', 'measurements.created_by', 'users.id')
        .select('users.username', 'measurements.id', 'measurements.name', 'measurements.description', 'measurements.created_at AS createdAt', 'measurements.created_by as createdBy',)
        .orderBy(sort, order)
        .paginate({
            perPage: perPage,
            currentPage: page,
            isLengthAware: true,
        });
}

/**
 * Get all measurements created by the user from the database
 * @param {number} userId 
 * @param {string} sort 
 * @param {string} order 
 * @returns array of measurements
 */
function getMeasurementsOfUser(userId, sort = 'id', order = 'asc', page = 1, perPage = 10) {
    return knex.from('measurements')
        .innerJoin('users', 'measurements.created_by', 'users.id')
        .select('users.username', 'measurements.id', 'measurements.name', 'measurements.description', 'measurements.created_at AS createdAt', 'measurements.created_by as createdBy',)
        .where('users.id', userId)
        .orderBy(sort, order)
        .paginate({
            perPage: perPage,
            currentPage: page,
            isLengthAware: true,
        });
}

/**
 * Delete measurement from the measurements table
 * @param {number} id 
 * @returns result
 */
function deleteMeasurementFromMeasurements(id) {
    return knex.from('measurements')
        .where('id', id)
        .del();
}

/**
 * Delete all measurements from the database (only user for testing purposes)
 * @returns result
 */
function deleteAllMeasurements() {
    return knex.from('measurements')
        .del();
}

/**
 * Delete measurement data table from the database
 * @param {string} tableName 
 * @returns result
 */
function deleteMeasurementDataTable(tableName) {
    return knex.schema.dropTableIfExists(tableName);
}

/**
 * Get the measurement of given id
 * @param {number} id 
 * @returns array with measurement
 */
function getMeasurement(id) {
    return knex.from('measurements')
        .select('*')
        .where('id', id)
        .first();
}

/**
 * Get all timestamps data of given measurement and wavelength
 * @param {string} tableName 
 * @param {number} columns 
 * @returns array with timestamps of wavelength
 */
function getTimestampsOfWavelength(tableName, wavelength) {
    return knex.from(tableName)
        .select('id', `${wavelength} as wavelength`);
}

/**
 * Get all wavelengths of given measurement and timestamp
 * @param {string} tableName 
 * @param {number} timestamp 
 * @returns array with wavelengths of timestamp
 */
function getWavelengthsOfTimestamp(tableName, timestamps) {
    return knex.from(tableName)
        .select('*')
        .whereIn('id', timestamps);
}

/**
 * Get all wavelengths of measurement
 * @param {string} tableName 
 * @returns array with all wavelengths of measurement
 */
function getWavelengthsOfMeasurement(tableName) {
    return knex.from('information_schema.columns')
        .select('COLUMN_NAME AS columns')
        .where('table_name', tableName);
}

/**
 * Get all timestamp of measurement
 * @param {string} tableName 
 * @returns array of all timestamp of measurement
 */
function getAllTimestampsOfMeasurement(tableName) {
    return knex.from(tableName)
        .select('id');
}

/**
 * Get all data of given measurement
 * @param {string} tableName 
 * @returns array of all timestamps and wavelength of given measurement
 */
function getMeasurementData(tableName) {
    return knex.from(tableName)
        .select('*');
}
