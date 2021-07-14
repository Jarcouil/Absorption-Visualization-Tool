const router = require('express').Router({ mergeParams: true });
const measurementController = require("../controllers/measurementController");
const { authJwt } = require("../middleware");
const { verifyMeasurement } = require("../middleware");
const fs = require('fs');

router.get(
    '/',
    getMeasurementsOfUser
);
router.get(
    '/all',
    authJwt.isAdmin,
    getMeasurements
);
router.get(
    '/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getMeasurement
);
router.delete(
    '/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    deleteMeasurement
);
router.get(
    '/wavelengths/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getWavelengths
);
router.get(
    '/timestamps/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getTimestamps
);
router.get(
    '/data/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getMeasurementData
);
router.get(
    '/:id/timestamps',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getTimestampsOfWavelength
);
router.get(
    '/:id/wavelengths',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getWavelengthsOfTimestamp
);

/**
 * Delete measurement of given id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id id
 */
async function deleteMeasurement(req, res, next) {
    try {
        deleteFile(`./uploads/${getMeasurementName(req.params.id, res.measurement.name)}`);
        await measurementController.deleteMeasurementDataTable(getMeasurementName(req.params.id, res.measurement.name));
        await measurementController.deleteMeasurementFromMeasurements(req.params.id);
        return res.status(200).json({ message: `Meting ${res.measurement.name} is succesvol verwijderd` });
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Get all measurements created by the user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.query.sort
 * @param {*} req.query.order
 */
async function getMeasurementsOfUser(req, res, next) {
    try {
        const measurements = await measurementController.getMeasurementsOfUser(req.userId, req.query?.sort, req.query?.order, req.query?.page, req.query?.perPage);
        if (measurements.data.length < 1) {
            return res.status(404).json({ message: "Er zijn geen metingen gevonden" });
        }
        return res.status(200).json(measurements);
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Get all measurements
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.query.sort
 * @param {*} req.query.order
 */
async function getMeasurements(req, res, next) {
    try {
        const measurements = await measurementController.getMeasurements(req.query?.sort, req.query?.order, req.query?.page, req.query?.perPage);
        if (measurements.data.length < 1) {
            return res.status(404).json({ message: "Er zijn geen metingen gevonden" });
        }
        return res.status(200).json(measurements);
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Get measurement of given id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id
 */
function getMeasurement(req, res, next) {
    return res.status(200).json(res.measurement);
}

/**
 * Get data of given measurement id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id
 */
async function getMeasurementData(req, res, next) {
    try {
        const tableName = getMeasurementName(req.params.id, res.measurement.name);
        const data = await measurementController.getMeasurementData(tableName, req.query.xMin, req.query.xMax, req.query.yMin, req.query.yMax);
        return res.status(200).json(data);
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Get all timestamps of given wavelength from measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id
 * @param {number} req.query.wavelength
 */
async function getTimestampsOfWavelength(req, res, next) {
    try {
        const data = await measurementController.getTimestampsOfWavelength(getMeasurementName(res.measurement.id, res.measurement.name), req.query.wavelength);
        return res.status(200).json((data));
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Get all wavelengths of given timestamp
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id measurement id
 * @param {number} req.query.timestamp timestamp
 */
 async function getWavelengthsOfTimestamp(req, res, next) {
    try {
        const data = await measurementController.getWavelengthsOfTimestamp(getMeasurementName(res.measurement.id, res.measurement.name), JSON.parse(req.query.timestamps));
        return res.status(200).json(normalizeResultsArray(data));
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Get all wavelengths of given measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id measurement id
 */
 async function getWavelengths(req, res, next) {
    try {
        const data = await measurementController.getWavelengthsOfMeasurement(getMeasurementName(res.measurement.id, res.measurement.name));
        return res.status(200).json(normalizeResultsArray(data).columns);
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Get all timestamps of measurements
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id measurement id
 */
 async function getTimestamps(req, res, next) {
    try {
        const data = await  measurementController.getAllTimestampsOfMeasurement(getMeasurementName(res.measurement.id, res.measurement.name));
        return res.status(200).json((normalizeResultsArray(data).timestamp));
    } catch (error) { return res.status(500).send(error);}
}

/**
 * Normalize array results (Merging the same keys of array of objects together)
 * @param {*} results 
 * @returns normalized array
 */
function normalizeResultsArray(results) {
    var normalResults = results.map(v => Object.assign({}, v));
    return normalResults.reduce(function (r, e) {
        return Object.keys(e).forEach(function (k) {
            if (!r[k]) r[k] = [].concat(e[k]);
            else r[k] = r[k].concat(e[k]);
        }), r;
    }, {});
}

/**
 * Delete folder and file of given foldername
 * @param {string} folderName 
 */
function deleteFile(folderName) {
    try {
        fs.rmSync(folderName, { recursive: true });
    } catch (err) {
        console.log("err", err);
    }
}

/**
 * Get the measurement name
 * @param {number} id 
 * @param {string} name 
 * @returns 
 */
 const getMeasurementName = (id, name) => `${id}_${name}`;

module.exports = router;
