const db_controller = require('../controllers/database_controller');

module.exports = {
    add_new_file,
    add_file_to_table,
}

function add_new_file(file){
    var sql = "CREATE TABLE IF NOT EXISTS ?? (id INT AUTO_INCREMENT PRIMARY KEY);"

    var data =  [file.name.split('.')[0]]
    
    var i;
    for(i=200; i < 801; i++){
        data.push(i)
    }

    return db_controller.insert_file_sql(sql, data);
}

function add_file_to_table(name){
    var sql = "INSERT INTO `measurements` (name) VALUES ('??');"

    return db_controller.execute_sql(sql, [name])
}