const db_controller = require('./database_controller');

module.exports = {
    add_file_to_table,
    add_new_file,
    rename_measurement_table,
    get_csv_data,
}

function add_new_file(name, minWaveLength, maxWaveLength) {
    var sql = "CREATE TABLE IF NOT EXISTS ?? (id INT AUTO_INCREMENT PRIMARY KEY);"
    var data = [name]
    var i;
    for (i = minWaveLength; i < maxWaveLength + 1; i++) {
        data.push(i)
    }

    return db_controller.insert_file_sql(sql, data);
}

function add_file_to_table(name, description, createdBy) {
    var sql = "INSERT INTO `measurements` (name, description, created_by) VALUES (?, ?, ?);"

    return db_controller.execute_sql(sql, [name, description, createdBy])
}

function rename_measurement_table(table_name, new_table_name) {
    var sql = "ALTER TABLE ?? RENAME ??;"

    return db_controller.execute_sql(sql, [table_name, new_table_name])
}

function get_csv_data(table_name, minWavelength, maxWavelength, minTimestamp, maxTimestamp) {
    var sql = get_columns_sql(minWavelength, maxWavelength, minTimestamp, maxTimestamp);
    var data = []

    for (var i = minWavelength; i <= maxWavelength; i++) {
        data.push(i)
    }

    data.push(table_name)
    
    for (var j = minTimestamp; j <= maxTimestamp; j++) {
        data.push(j)
    }

    return db_controller.execute_sql(sql, data);
}

function get_columns_sql(minWavelength, maxWavelength, minTimestamp, maxTimestamp) {
    var sql = "SELECT id, ";
    var i = minWavelength;
    for (i; i <= maxWavelength; i++) {
        if (i == maxWavelength) {
            sql = sql + "??";
        } else {
            sql = sql + "??, ";
        }
    }
    sql = sql + "FROM ?? WHERE id IN (";

    var j = minTimestamp;
    for (j; j <= maxTimestamp; j++) {
        if (j == maxTimestamp) {
            sql = sql + "?";
        } else {
            sql = sql + "?, ";
        }
    }

    return sql + ");"

}