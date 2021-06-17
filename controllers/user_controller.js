const knex = require('../knex');

module.exports = {
  delete_all_users,
  delete_user,
  get_user_by_email,
  get_user_by_username,
  get_user,
  get_users,
  toggle_admin
}

/**
 * Get all users from database
 * @param {string} sort 
 * @param {string} order 
 * @returns array of users
 */
function get_users(sort, order) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .orderBy(sort, order)
}

/**
 * Get user with given id from database
 * @param {number} id 
 * @returns array with user
 */
function get_user(id) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('id', id)
}

/**
 * Delete user with given id
 * @param {number} id 
 * @returns result
 */
function delete_user(id) {
  return knex.from('users')
    .where('id', id)
    .del()
}

/**
 * Toggle admin permissions of user
 * @param {number} id 
 * @returns result
 */
function toggle_admin(id) {
  return knex.from('users')
    .update({ is_admin: knex.raw('!??', ['is_admin']) })
    .where('id', id)
}

/**
 * Get user with given email from database
 * @param {string} email 
 * @returns array with user
 */
function get_user_by_email(email) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('email', email)
}

/**
 * Get user with given username from database
 * @param {string} username 
 * @returns array with user
 */
function get_user_by_username(username) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('username', username)
}

/**
 * Delete all users from the database (only used for testing purposes)
 * @returns result
 */
function delete_all_users() {
  return knex.from('users')
    .del()
}
