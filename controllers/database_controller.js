var sql_connection = require('../database_connect');

module.exports = {
    execute_sql,
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

function getAlterTableSQL(data) {
    var sql = "ALTER TABLE `" + data.shift() + "`"
    data.forEach(element => {
        sql = sql + " ADD COLUMN `" + element.toString() + "` FLOAT,"
    });
    return sql.slice(0, -1) + ";"
}
