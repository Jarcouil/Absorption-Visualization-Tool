var db_controller = require('./database_controller');

module.exports = {
    get_all_scans,
    get_measurement,
    get_column_of_measurement,
}

function get_all_scans(){
    var sql = "SELECT * FROM measurements;"

    return db_controller.execute_sql(sql);
}

function get_measurement(name){
    var sql = "SELECT * FROM ??;";

    return db_controller.execute_sql(sql, [name]);
}

function get_column_of_measurement(name, column){
    var sql = "SELECT ?? FROM ??;";

    return db_controller.execute_sql(sql, [column, name]);
}