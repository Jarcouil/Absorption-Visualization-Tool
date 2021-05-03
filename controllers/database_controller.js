var sql_connection = require('../database_connect');

module.exports = {
    execute_sql,
    insert_data,
    insert_file_sql,
}

function execute_sql(sql, data = null) {
    // Return new promise 
    return new Promise(function (resolve, reject) {
        sql_connection.query(
            sql,
            data,
            function (error, result, fields) {
                if (error)
                    reject(error);

                if (result) {
                    resolve(result);
                } else {
                    reject();
                }
            }
        );
    })
}

function insert_data(sql, data) {
    sql = getInsertdataSQL(data)
    return new Promise(function (resolve, reject) {
        if (err) { reject(err); }

        sql_connection.query(sql, data, function (err, result) {
            if (err) {
                sql_connection.rollback(function () {
                    reject(err);
                    return;
                });
            }
        })

    })
}

function insert_file_sql(sql, data) {
    return new Promise(function (resolve, reject) {
        sql_connection.beginTransaction(function (err) {
            if (err) { reject(err); }

            // Create table
            sql_connection.query(sql, data, function (err, result) {
                if (err) {
                    sql_connection.rollback(function () {
                        reject(err);
                        return;
                    });
                }
            })

            sql = getAlterTableSQL(data)

            // Add Columns
            sql_connection.query(sql, data, function (err, result) {
                if (err) {
                    sql_connection.rollback(function () {
                        reject(err)
                        return
                    });
                }
            })

            sql_connection.commit(function (err) {
                if (err) {
                    sql_connection.rollback(function () {
                        reject(err);
                        return
                    });
                }
                resolve();
                console.log('Transaction completed succesfully')
            });
        })
    })
}

function getInsertdataSQL(data) {
    var sql = "INSERT INTO `" + data.shift() + "` VALUES "

    data.forEach(element => {
        var row = ""
        element.forEach(element2 => {
            row = row + ", `" + element2.toString() + "` "
        })
        sql = sql + "(" + row + "),"
    })
    return sql.slice(0, -1) + ";"
}

function getAlterTableSQL(data) {
    var sql = "ALTER TABLE `" + data.shift() + "`"
    data.forEach(element => {
        sql = sql + " ADD COLUMN `" + element.toString() + "` FLOAT,"
    });
    return sql.slice(0, -1) + ";"
}

