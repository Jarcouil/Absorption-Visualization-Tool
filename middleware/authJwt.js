const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const roleEnum = require('./roleEnum')
const user_controller = require("../controllers/user_controller");

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
  user_controller.get_user(req.userId).then(users => {
    if (users.length > 0) {
      const user = users[0];

      if (user.isAdmin == roleEnum.admin) {
        next();
        return;
      }
    }
    res.status(403).send({
      message: "Require Admin Role!"
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin
};

module.exports = authJwt;
