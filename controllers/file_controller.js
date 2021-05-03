const db_controller = require('./database_controller');

module.exports = {
    add_file_to_table,
    add_new_file,
    rename_measurement_table,
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

function add_file_to_table(name, description) {
    var sql = "INSERT INTO `measurements` (name, description) VALUES (?, ?);"

    return db_controller.execute_sql(sql, [name, description])
}

function rename_measurement_table(table_name, new_table_name) {
    var sql = "ALTER TABLE ?? RENAME ??;"

    return db_controller.execute_sql(sql, [table_name, new_table_name])
}