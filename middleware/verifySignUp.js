const roleEnum = require('./roleEnum');
const userController = require("../controllers/userController");

/**
 * Check if all required parameters are present.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkParameters = (req, res, next) => {
  if (!req.body.username) return res.status(400).json({ message: "Gebruikersnaam is verplicht!" });
  if (!req.body.email) return res.status(400).json({ message: "Emailadres is verplicht!" });
  if (!req.body.password) return res.status(400).json({ message: "Wachtwoord is verplicht!" });
  next();
};

/**
 * Check if username is already taken
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkDuplicateUsername = (req, res, next) => {
  userController.getUserByUsername(req.body.username).then(user => {
    if (user) return res.status(400).send({message: "Helaas! Deze gebruikersnaam is helaas al in gebruik!"});
    next();
  });
};

/**
 * Check if email is already taken
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkDuplicateEmail = (req, res, next) => {
  userController.getUserByEmail(req.body.email).then(user => {
    if (user) return res.status(400).send({message: "Helaas! Dit emailadres is helaas al in gebruik!"});
    next();
  });
};

/**
 * Check if role exists
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkRolesExisted = (req, res, next) => {
  if (req.body.isAdmin) {
    let roleExists = false;
    if (Object.values(roleEnum).includes(+req.body.isAdmin)) roleExists = true
    if (!roleExists) return res.status(400).send({message: "Failed! Role does not exist = " + req.body.isAdmin});
  }
  next();
};

/**
 * Check if email is of valid format
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkValidEmail = (req, res, next) => {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!req.body.email) return res.status(400).json({ message: "Emailadres is verplicht!" });
  if (!re.test(req.body.email)) return res.status(400).send({message: "Helaas! Dit emailadres is helaas niet geldig!"});

  next();
};

/**
 * Check if password is of minimal length.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkPasswordLength = (req, res, next) => {
  if (req.body.password.length < 6) return res.status(400).send({message: "Wachtwoord moet minimaal 6 tekens lang zijn!"});
  next();
};

const verifySignUp = {
  checkDuplicateEmail: checkDuplicateEmail,
  checkDuplicateUsername: checkDuplicateUsername,
  checkRolesExisted: checkRolesExisted,
  checkValidEmail: checkValidEmail,
  checkPasswordLength: checkPasswordLength,
  checkParameters: checkParameters
};

module.exports = verifySignUp;