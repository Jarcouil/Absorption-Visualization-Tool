const knex = require('../knex');

module.exports = {
    addToMeasurements,
    createNewTable,
    renameMeasurementTable,
    getCustomData,
}

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
            table.increments('id')
            var i;
            for (i = minWaveLength; i < maxWaveLength + 1; i++) {
                table.float(i.toString())
            }
        })
}

/**
 * Add measurement meta data to the measurment table
 * @param {string} name 
 * @param {string} description 
 * @param number createdBy 
 * @returns result
 */
function addToMeasurements(name, description, createdBy) {
    return knex('measurements')
        .insert({ name: name, description: description, created_by: createdBy })
}

/**
 * Rename the data table
 * @param {string} tableName 
 * @param {string} newTableName 
 * @returns result
 */
function renameMeasurementTable(tableName, newTableName) {
    return knex.schema.renameTable(tableName, newTableName)
}

/**
 * Get the measurement data of the given min and max wavelengths and the given min and max timestamps
 * @param {string} tableName 
 * @param {number} minWavelength 
 * @param {number} maxWavelength 
 * @param {number} minTimestamp 
 * @param {number} maxTimestamp 
 * @returns array results
 */
function getCustomData(tableName, minWavelength, maxWavelength, minTimestamp, maxTimestamp) {
    var columns = ['id']
    var rows = []
    for (var i = minWavelength; i <= maxWavelength; i++) columns.push(i.toString())
    for (var j = minTimestamp; j <= maxTimestamp; j++) rows.push(j)

    return knex.columns(columns).select()
        .from(tableName)
        .whereIn('id', rows)
}
