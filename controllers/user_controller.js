const db_controller = require('./database_controller');

module.exports = {
  delete_user,
  get_user,
  get_users,
  toggle_admin,
  get_user_by_email,
  delete_all_users
}

function get_users() {
  const sql = "SELECT id, username, email, is_admin as isAdmin, created_at as createdAt FROM users;"

  return db_controller.execute_sql(sql);
}

function get_user(id) {
  const sql = "SELECT id, username, email, is_admin as isAdmin, created_at as createdAt FROM users WHERE id = ?;"

  return db_controller.execute_sql(sql, [id]);
}

function delete_user(id) {
  const sql = "DELETE FROM users WHERE id = ?;"

  return db_controller.execute_sql(sql, [id]);
}

function toggle_admin(id) {
  const sql = "UPDATE users SET is_admin = !is_admin WHERE id =  ?;";

  return db_controller.execute_sql(sql, [id]);
}

function get_user_by_email(email) {
  const sql = "SELECT id, username, email FROM users WHERE email = ?;"

  return db_controller.execute_sql(sql, [email]);
}

function delete_all_users() {
  const sql = "DELETE FROM users;";

  return db_controller.execute_sql(sql);
}
