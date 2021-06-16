const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db_controller = require('../controllers/database_controller');
const roleEnum = require('./roleEnum')

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const isAdmin = (req, res, next) => {
  const sql = "SELECT * FROM users WHERE id = ?;"

  db_controller.execute_sql(sql, [req.userId]).then(users => {
    if (users.length > 0) {
      const user = users[0];

      if (user.is_admin == roleEnum.admin) {
        next();
        return;
      }
    }

    res.status(403).send({
      message: "Require Admin Role!"
    });
    return;
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin
};
module.exports = authJwt;
