const path = require('path');

/**
 * Check Create arrays of numbers between min and max timestamp and or wavelengths if given
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkParameters = (req, res, next) => {
    if (!req.query.wavelengths) {
        let wavelengths = [];
        for (var i = req.query.minWavelength; i <= req.query.maxWavelength; i++) wavelengths.push(i.toString()); // add all numbers between min and max wavelength to array
        res.wavelengths = wavelengths;
    } else {
        res.wavelengths = JSON.parse(req.query.wavelengths);
    }

    next();
};

const verifyExport = {
    checkParameters: checkParameters,
};

module.exports = verifyExport;