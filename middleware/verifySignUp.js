const roleEnum = require('./roleEnum')
const db_controller = require('../controllers/database_controller');

const checkDuplicateUsernameOrEmail = (req, res, next) => {
  let sql = "SELECT * FROM users WHERE username = ?;";

  db_controller.execute_sql(sql, [req.body.username]).then(users => {
    if (users.length > 0) {
      res.status(400).send({
        message: "Failed! Username is already in use!"
      });
      return;
    }
    sql = "SELECT * FROM users WHERE email = ?;";

    db_controller.execute_sql(sql, [req.body.email]).then(users => {
      if (users.length > 0) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }
      next();
    });
  });
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.isAdmin) {
    let roleExists = false;
    for (const key in roleEnum) {
      if (req.body.isAdmin == roleEnum[key].toString()) {
        roleExists = true
      }
    }

    if (!roleExists) {
      res.status(400).send({
        message: "Failed! Role does not exist = " + req.body.isAdmin
      });
      return;
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
  checkRolesExisted: checkRolesExisted
};

module.exports = verifySignUp;