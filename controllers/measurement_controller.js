var db_controller = require('./database_controller');

module.exports = {
    get_all_scans,
    get_measurement,
    get_columns_of_measurement,
}

function get_all_scans(){
    var sql = "SELECT * FROM measurements;"

    return db_controller.execute_sql(sql);
}

function get_measurement(name){
    var sql = "SELECT * FROM ??;";

    return db_controller.execute_sql(sql, [name]);
}

function get_columns_of_measurement(name, columns){
    if (typeof(columns) != "object"){
        columns = [columns] 
    }
    var sql = get_columns_sql(columns);
    var data = columns
    data.push(name)
    return db_controller.execute_sql(sql, data);
    
}

function get_columns_sql(columns){ 
    var sql = "SELECT ";
    var i = 0;
    for(i; i < columns.length; i++){
        if (i == columns.length-1){
            sql = sql + "?? ";
        } else {
        sql = sql + "??, ";
        }
    }

    return sql + "FROM ??;";
}