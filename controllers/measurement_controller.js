var db_controller = require('./database_controller');

module.exports = {
    get_all_scans,
    get_measurement,
    get_all_id_of_wavelength,
    get_all_wavelengths_of_id,
    delete_scan,
    get_all_columns_of_measurement,
    get_all_ids_of_measurement,
    get_measurement_data
}

function get_all_scans() {
    var sql = "SELECT * FROM measurements;"

    return db_controller.execute_sql(sql);
}

function delete_scan(id) {
    var sql = "DELETE FROM measurements WHERE id = ?;"

    return db_controller.execute_sql(sql, [id]);
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
    var sql = "SELECT * FROM ?? WHERE (id = ?);"
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
    var sql = "SELECT * FROM ?? LIMIT 500;";

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
