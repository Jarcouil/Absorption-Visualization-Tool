const db_controller = require('./database_controller');

module.exports = {
  delete_user,
  get_user,
  get_users,
  toggle_admin
}

function get_users() {
  var sql = "SELECT id, username, email, isAdmin, createdAt FROM users;"

  return db_controller.execute_sql(sql);
}

function get_user(id) {
  var sql = "SELECT id, username, email, isAdmin, createdAt FROM users WHERE id = ?;"

  return db_controller.execute_sql(sql, [id]);
}

function delete_user(id) {
  var sql = "DELETE FROM users WHERE id = ?;"

  return db_controller.execute_sql(sql, [id]);
}

function toggle_admin(id) {
  var sql = "UPDATE users SET isAdmin = !isAdmin WHERE id =  ?;";

  return db_controller.execute_sql(sql, [id]);
}
