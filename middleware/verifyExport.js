const path = require('path');

/**
 * Check Create arrays of numbers between min and max timestamp and or wavelengths if given
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkParameters = (req, res, next) => {
    let timestamps = [];
    const secondsSamplingrate = res.measurement.samplingRate / 1000;
    for (var j = +req.query.minTimestamp; j <= +req.query.maxTimestamp; j = Math.round((j+secondsSamplingrate)*10)/10) timestamps.push(+j); // add all numbers between min and max timestamp
    res.timestamps = timestamps;

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