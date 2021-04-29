const db_controller = require('./database_controller');

module.exports = {
  get_users,
  get_user,
  delete_user
}

function get_users() {
  var sql = "SELECT * FROM users;"

  return db_controller.execute_sql(sql);
}

function get_user(id) {
  var sql = "SELECT * FROM users WHERE id = ?;"

  return db_controller.execute_sql(sql, [id]);
}

function delete_user(id) {
  var sql = "DELETE FROM users WHERE id = ?;"

  return db_controller.execute_sql(sql, [id]);
}
