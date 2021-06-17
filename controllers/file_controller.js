const knex = require('../knex');

module.exports = {
    add_to_measurements,
    create_new_table,
    rename_measurement_table,
    get_csv_data,
}

function create_new_table(tableName, minWaveLength, maxWaveLength) {
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

function add_to_measurements(name, description, createdBy) {
    return knex('measurements')
        .insert({ name: name, description: description, created_by: createdBy })
}

function rename_measurement_table(tableName, newTableName) {
    return knex.schema.renameTable(tableName, newTableName)
}

function get_csv_data(tableName, minWavelength, maxWavelength, minTimestamp, maxTimestamp) {
    var columns = ['id']
    var rows = []
    for (var i = minWavelength; i <= maxWavelength; i++) {
        columns.push(i.toString())
    }
    for (var j = minTimestamp; j <= maxTimestamp; j++) {
        rows.push(j)
    }

    return knex.columns(columns).select()
        .from(tableName)
        .whereIn('id', rows)
}
