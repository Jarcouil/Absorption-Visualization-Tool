const authJwt = require("./authJwt");
const verifySignUp = require("./verifySignUp");
const verifyFile = require("./verifyFile");
const verifyLogin = require("./verifyLogin");
const verifyMeasurement = require("./verifyMeasurement");
const verifyUser = require("./verifyUser");
const verifyExport = require("./verifyExport");

module.exports = {
  authJwt,
  verifySignUp,
  verifyFile,
  verifyMeasurement,
  verifyLogin,
  verifyUser,
  verifyExport
};