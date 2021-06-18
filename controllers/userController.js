const knex = require('../knex');

module.exports = {
  deleteAllUsers,
  deleteUser,
  getUserByEmail,
  getUserByUsername,
  getUser,
  getUsers,
  toggleAdmin
}

/**
 * Get all users from database
 * @param {string} sort 
 * @param {string} order 
 * @returns array of users
 */
function getUsers(sort = 'id', order = 'asc') {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .orderBy(sort, order)
}

/**
 * Get user with given id from database
 * @param {number} id 
 * @returns array with user
 */
function getUser(id) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('id', id)
}

/**
 * Delete user with given id
 * @param {number} id 
 * @returns result
 */
function deleteUser(id) {
  return knex.from('users')
    .where('id', id)
    .del()
}

/**
 * Toggle admin permissions of user
 * @param {number} id 
 * @returns result
 */
function toggleAdmin(id) {
  return knex.from('users')
    .update({ is_admin: knex.raw('!??', ['is_admin']) })
    .where('id', id)
}

/**
 * Get user with given email from database
 * @param {string} email 
 * @returns array with user
 */
function getUserByEmail(email) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('email', email)
}

/**
 * Get user with given username from database
 * @param {string} username 
 * @returns array with user
 */
function getUserByUsername(username) {
  return knex.from('users')
    .select('id', 'username', 'email', 'is_admin as isAdmin', 'created_at as createdAt')
    .where('username', username)
}

/**
 * Delete all users from the database (only used for testing purposes)
 * @returns result
 */
function deleteAllUsers() {
  return knex.from('users')
    .del()
}
