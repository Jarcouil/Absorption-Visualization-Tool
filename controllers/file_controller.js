const db_controller = require('./database_controller');

module.exports = {
    add_new_file,
    add_file_to_table,
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