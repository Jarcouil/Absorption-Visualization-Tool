const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const verifyFile = require("./verifyFile");
const verifyLogin = require("./verifyLogin");
const verifyMeasurement = require("./verifyMeasurement");
const verifyUser = require("./verifyUser");

module.exports = {
  authJwt,
  verifySignUp,
  verifyFile,
  verifyMeasurement,
  verifyLogin,
  verifyUser
};