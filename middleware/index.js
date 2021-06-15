const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const verifyFile = require("./verifyFile");
const verifyMeasurement = require("./verifyMeasurement");

module.exports = {
  authJwt,
  verifySignUp,
  verifyFile,
  verifyMeasurement
};