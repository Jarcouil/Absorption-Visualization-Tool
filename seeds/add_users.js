var bcrypt = require("bcryptjs");
const config = require("../config/config");

const users = [
    {
        username: config.users.admin.username,
        password: bcrypt.hashSync(config.users.admin.password, 8),
        email: config.users.admin.email,
        is_admin: 1
    },
    {
        username: config.users.user.username,
        password: bcrypt.hashSync(config.users.user.password, 8),
        email: config.users.user.email,
        is_admin: 0
    }
]

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert(users);
    });
};
