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
router.delete(
    '/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    deleteMeasurement
);
router.get(
    '/columns/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getWavelengths
);
router.get(
    '/data/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getMeasurementData
);
router.get(
    '/id/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getTimestamps
);
router.get(
    '/:id',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getMeasurement
);
router.get(
    '/:id/columns',
    [verifyMeasurement.ifMeasurement, verifyMeasurement.isAllowed],
    getTimestampsOfWavelength
);
router.get(
    '/:id/:timestamp',
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
function deleteMeasurement(req, res, next) {
    deleteFile('./uploads/' + req.params.id.toString() + '_' + res.measurement.name);
    measurementController.deleteMeasurementDataTable(getMeasurementName(req.params.id, res.measurement.name)).then(
        (result) => {
            measurementController.deleteMeasurementFromMeasurements(req.params.id).then(
                (result) => {
                    return res.status(200).json({ message: `Meting ${res.measurement.name} is succesvol verwijderd` });
                },
                (error) => { return res.status(500).json({ message: error }); }
            )
        },
        (error) => { return res.status(500).json({ message: error }); }
    )
}

/**
 * Get all measurements created by the user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.query.sort
 * @param {*} req.query.order
 */
function getMeasurementsOfUser(req, res, next) {
    measurementController.getMeasurementsOfUser(req.userId, req.query?.sort, req.query?.order).then(
        (measurements) => {
            if (measurements.length < 1) {
                return res.status(404).json({ message: "Er zijn geen metingen gevonden" });
            }
            return res.status(200).json(measurements);
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Get all measurements
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.query.sort
 * @param {*} req.query.order
 */
function getMeasurements(req, res, next) {
    measurementController.getMeasurements(req.query?.sort, req.query?.order).then(
        (measurements) => {
            if (measurements.length < 1) {
                return res.status(404).json({ message: "Er zijn geen metingen gevonden" });
            }
            return res.status(200).json(measurements);
        },
        (error) => { return res.status(500).send(error) }
    )
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
function getMeasurementData(req, res, next) {
    measurementController.getMeasurementData(getMeasurementName(res.measurement.id, res.measurement.name)).then(
        (data) => {
            return res.status(200).json(removeIdFromAllData(data));
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Get all timestamps of given wavelength from measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id
 * @param {number} req.query.wavelength
 */
function getTimestampsOfWavelength(req, res, next) {
    measurementController.getTimestampsOfWavelength(getMeasurementName(res.measurement.id, res.measurement.name), req.query.wavelength).then(
        (data) => {
            return res.status(200).json((data));
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Get all wavelengths of given timestamp
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id measurement id
 * @param {number} req.query.timestamp timestamp
 */
function getWavelengthsOfTimestamp(req, res, next) {
    measurementController.getWavelengthsOfTimestamp(getMeasurementName(res.measurement.id, res.measurement.name), req.params.timestamp).then(
        (data) => {
            return res.status(200).json(removeIdFromAllWavelengths(normalizeResultsSingle(data)));
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Get all wavelengths of given measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id measurement id
 */
function getWavelengths(req, res, next) {
    measurementController.getWavelengthsOfMeasurement(getMeasurementName(res.measurement.id, res.measurement.name)).then(
        (data) => {
            return res.status(200).json(removeIdFromWavelengths(normalizeResultsArray(data)['columns']));
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Get all timestamps of measurements
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {number} req.params.id measurement id
 */
function getTimestamps(req, res, next) {
    measurementController.getAllTimestampsOfMeasurement(getMeasurementName(res.measurement.id, res.measurement.name)).then(
        (data) => {
            return res.status(200).json((normalizeResultsArray(data)['id']));
        },
        (error) => { return res.status(500).send(error) }
    )
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
            if (!r[k]) r[k] = [].concat(e[k])
            else r[k] = r[k].concat(e[k])
        }), r
    }, {})
}

/**
 * Normalize array results (Merging the same keys of array of objects together)
 * @param {*} results 
 * @returns normalized array
 */
function normalizeResultsSingle(results) {
    var normalResults = results.map(v => Object.assign({}, v));
    return normalResults.reduce(function (r, e) {
        return Object.keys(e).forEach(function (k) {
            if (!r[k]) r[k] = e[k]
            else r[k] = r[k].concat(e[k])
        }), r
    }, {})
}

/**
 * Remove id from wavelengths
 * @param {*} columns 
 * @returns data
 */
function removeIdFromWavelengths(data) {
    const index = data.indexOf('id');
    if (index > -1) {
        data.splice(index, 1);
    }
    return data;
}

/**
 * Remove id from wavelegnths
 * @param {*} result 
 * @returns result
 */
function removeIdFromAllWavelengths(result) {
    delete result['id'];
    return result;
}

/**
 * Remove id from all data
 * @param {*} result 
 * @returns result
 */
function removeIdFromAllData(result) {
    result.map(element => {
        delete element['id'];
    })
    return result;
}

/**
 * Delete folder and file of given foldername
 * @param {string} folderName 
 */
function deleteFile(folderName) {
    try {
        fs.rmSync(folderName, { recursive: true })
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
function getMeasurementName(id, name) {
    return id.toString() + '_' + name
}

module.exports = router;
