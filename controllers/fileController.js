const options = require('../knexfile');
const knex = require("knex")(options);

module.exports = {
    addToMeasurements,
    createNewTable,
    renameMeasurementTable,
    getCustomData,
};

/**
 * Create a new table for the data of a new measurement
 * @param {string} tableName 
 * @param {number} minWaveLength 
 * @param {number} maxWaveLength 
 * @returns result
 */
function createNewTable(tableName, minWaveLength, maxWaveLength) {
    return knex.schema
        .dropTableIfExists(tableName)
        .createTable(tableName, (table) => {
            table.increments('id');
            for (var i = minWaveLength; i < maxWaveLength + 1; i++) {
                table.specificType(i.toString(), 'float');
            }
        });
}

/**
 * Add measurement meta data to the measurement table
 * @param {string} name 
 * @param {string} description 
 * @param number createdBy 
 * @returns insertId
 */
function addToMeasurements(name, description, createdBy) {
    return knex('measurements')
        .insert({ name: name, description: description, created_by: createdBy });
}

/**
 * Rename the data table
 * @param {string} tableName 
 * @param {string} newTableName 
 * @returns result
 */
function renameMeasurementTable(tableName, newTableName) {
    return knex.schema.renameTable(tableName, newTableName);
}

/**
 * Get the measurement data of the given min and max wavelengths and the given min and max timestamps
 * @param {string} tableName 
 * @param {number[]} timestamps 
 * @param {number[]} wavelengths
 * @returns array results
 */
function getCustomData(tableName, timestamps, wavelengths) {
    wavelengths.unshift('id')

    return knex.columns(wavelengths).select()
        .from(tableName)
        .whereIn('id', timestamps);
}
