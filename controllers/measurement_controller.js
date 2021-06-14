const db_controller = require('./database_controller');

module.exports = {
    delete_measurement_data_table,
    delete_measurement_from_measurements,
    get_all_columns_of_measurement,
    get_all_id_of_wavelength,
    get_all_ids_of_measurement,
    get_all_measurements,
    get_all_wavelengths_of_id,
    get_measurement,
    get_measurement_data,
    get_table_name_of_id,
    get_all_measurements_of_user,
    delete_all_measurements
}

function get_all_measurements() {
    var sql = "SELECT u.username, m.* FROM measurements m inner join users u on m.createdBy = u.id;"

    return db_controller.execute_sql(sql);
}

function get_all_measurements_of_user(userId) {
    var sql = "SELECT u.username, m.* FROM measurements m inner join users u on m.createdBy = u.id WHERE u.id = ?;"

    return db_controller.execute_sql(sql, [userId]);
}

function get_table_name_of_id(id) {
    var sql = "SELECT name FROM measurements WHERE id = ?;"

    return db_controller.execute_sql(sql, [id]);
}

function delete_measurement_from_measurements(id) {
    var sql = "DELETE FROM measurements WHERE id = ?;"

    return db_controller.execute_sql(sql, [id]);
}

function delete_all_measurements() {
    var sql = "DELETE FROM measurements;"

    return db_controller.execute_sql(sql);
}

function delete_measurement_data_table(tablename) {
    var sql = "DROP TABLE IF EXISTS ??;"

    return db_controller.execute_sql(sql, [tablename]);
}

function get_measurement(id) {
    var sql = "SELECT * FROM measurements WHERE id = ?;"

    return db_controller.execute_sql(sql, [id]);
}

function get_all_id_of_wavelength(name, columns) {
    if (typeof (columns) != "object") {
        columns = [columns]
    }
    var sql = get_columns_sql(columns);
    var data = columns
    data.push(name)
    return db_controller.execute_sql(sql, data);

}

function get_all_wavelengths_of_id(name, id) {
    var sql = "SELECT * FROM ??  WHERE (id = ?) ;"
    var data = [name, id]
    return db_controller.execute_sql(sql, data);
}

function get_all_columns_of_measurement(id) {
    var sql = "SELECT COLUMN_NAME AS columns FROM information_schema.columns WHERE table_name = ?;";

    return db_controller.execute_sql(sql, [id]);
}

function get_all_ids_of_measurement(id) {
    var sql = "SELECT id FROM ??;";

    return db_controller.execute_sql(sql, [id]);
}

function get_measurement_data(id) {
    var sql = "SELECT * FROM ??;";

    return db_controller.execute_sql(sql, [id])
}

function get_columns_sql(columns) {
    var sql = "SELECT id, ";
    var i = 0;
    for (i; i < columns.length; i++) {
        if (i == columns.length - 1) {
            sql = sql + "?? as 'wavelength' ";
        } else {
            sql = sql + "?? as 'wavelength', ";
        }
    }

    return sql + "FROM ??;";
}
