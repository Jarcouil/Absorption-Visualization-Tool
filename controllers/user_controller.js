const knex = require('../knex');

module.exports = {
  delete_user,
  get_user,
  get_users,
  toggle_admin,
  get_user_by_email,
  delete_all_users,
  get_user_by_username
}

function get_users(sort, order) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .orderBy(sort, order)
}

function get_user(id) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('id', id)
}

function delete_user(id) {
  return knex.from('users')
    .where('id', id)
    .del()
}

function toggle_admin(id) {
  return knex.from('users')
    .update({ is_admin: knex.raw('!??', ['is_admin']) })
    .where('id', id)
}

function get_user_by_email(email) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('email', email)
}

function get_user_by_username(username) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('username', username)
}

function delete_all_users() {
  return knex.from('users')
    .del()
}
