const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const verifyFile = require("./verifyFile");
const verifyLogin = require("./verifyLogin");
const verifyMeasurement = require("./verifyMeasurement");

module.exports = {
  authJwt,
  verifySignUp,
  verifyFile,
  verifyMeasurement,
  verifyLogin
};