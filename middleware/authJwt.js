const jwt = require("jsonwebtoken");
const roleEnum = require('./roleEnum')
const userController = require("../controllers/userController");
const config = require("../config/config");

/**
 * Verify if token is valid
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return res.status(401).send({message: "No token provided!"});

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(401).send({message: "Unauthorized!"});
    req.userId = decoded.id;
    next();
  });
};

/**
 * Check if user has admin role
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isAdmin = async (req, res, next) => {
  try {
    const user = await userController.getUser(req.userId);
    if (user?.isAdmin !== roleEnum.admin) return res.status(403).send({message: "Require Admin Role!"});
    next();
  } catch (error) { return res.status(500).send(error)}
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin
};

module.exports = authJwt;
