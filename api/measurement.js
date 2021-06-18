const router = require('express').Router({ mergeParams: true });
const measurementController = require("../controllers/measurementController");
const { authJwt } = require("../middleware");
const { verifyMeasurement } = require("../middleware");
const fs = require('fs');

router.get(
    '/',
    getAllMeasurementsOfUser
);
router.get(
    '/all',
    authJwt.isAdmin,
    getAllMeasurements
);
router.delete(
    '/:id',
    [verifyMeasurement.ifMeasurements, verifyMeasurement.isAllowed],
    deleteMeasurement
);
router.get(
    '/columns/:id',
    [verifyMeasurement.ifMeasurements, verifyMeasurement.isAllowed],
    getAllWavelengths
);
router.get(
    '/data/:id',
    [verifyMeasurement.ifMeasurements, verifyMeasurement.isAllowed],
    getMeasurementData
);
router.get(
    '/id/:id', 
    [verifyMeasurement.ifMeasurements, verifyMeasurement.isAllowed],
    getAllIds
);
router.get(
    '/:id',
    [verifyMeasurement.ifMeasurements, verifyMeasurement.isAllowed],
    getMeasurement
);
router.get(
    '/:id/columns',
    [verifyMeasurement.ifMeasurements, verifyMeasurement.isAllowed],
    getAllTimestampsOfWavelength
);
router.get(
    '/:id/:timestamp',
    [verifyMeasurement.ifMeasurements, verifyMeasurement.isAllowed],
    getAllWavelengthsOfTimestamp
);

function deleteMeasurement(req, res, next) {
    const measurement = res.measurements[0]
    delete_file('./uploads/' + req.params.id.toString() + '_' + measurement.name);
    measurementController.deleteMeasurementDataTable(getMeasurmentName(req.params.id, measurement.name)).then(
        (result) => {
            measurementController.deleteMeasurementFromMeasurements(req.params.id).then(
                (result) => {
                    return res.status(200).json({ message: `Meting ${measurement.name} is succesvol verwijderd` });
                },
                (error) => { return res.status(500).json({ message: error }); }
            )
        },
        (error) => { return res.status(500).json({ message: error }); }
    )
}

function getAllMeasurementsOfUser(req, res, next) {
    measurementController.getAllMeasurementsOfUser(req.userId, req.query?.sort, req.query?.order).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Er zijn geen metingen gevonden" });
            }
            return res.status(200).json(result);
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getAllMeasurements(req, res, next) {
    measurementController.getAllMeasurements(req.query?.sort, req.query?.order).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Er zijn geen metingen gevonden" });
            }
            return res.status(200).json(result);
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getMeasurement(req, res, next) {
    return res.status(200).json(res.measurements[0]);
}

function getMeasurementData(req, res, next) {
    const measurement = res.measurements[0]
    measurementController.getMeasurementData(getMeasurmentName(measurement.id, measurement.name)).then(
        (data) => {
            return res.status(200).json(removeIdFromAllData(data));
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getAllTimestampsOfWavelength(req, res, next) {
    const measurement = res.measurements[0]
    measurementController.getAllTimestampsOfWavelength(getMeasurmentName(measurement.id, measurement.name), req.query.c).then(
        (result) => {
            return res.status(200).json((result));
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getAllWavelengthsOfTimestamp(req, res, next) {
    const measurement = res.measurements[0]
    measurementController.getAllWavelengthsOfTimestamp(getMeasurmentName(measurement.id, measurement.name), req.params.timestamp).then(
        (result) => {
            return res.status(200).json(removeIdFromAllWavelengths(normalizeResultsSingle(result)));
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getAllWavelengths(req, res, next) {
    const measurement = res.measurements[0]         
    measurementController.getAllWavelengthsOfMeasurement(getMeasurmentName(measurement.id, measurement.name)).then(
        (result) => {
            return res.status(200).json(removeIdFromWavelengths(normalizeResultsArray(result)['columns']));
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getAllIds(req, res, next) {
    const measurement = res.measurements[0]
    measurementController.getAllTimestampsOfMeasurement(getMeasurmentName(measurement.id, measurement.name)).then(
        (result) => {
            return res.status(200).json((normalizeResultsArray(result)['id']));
        },
        (error) => { return res.status(500).send(error) }
    )
}

function normalizeResultsArray(results) {
    var normalResults = results.map(v => Object.assign({}, v));
    return normalResults.reduce(function (r, e) {
        return Object.keys(e).forEach(function (k) {
            if (!r[k]) r[k] = [].concat(e[k])
            else r[k] = r[k].concat(e[k])
        }), r
    }, {})
}

function normalizeResultsSingle(results) {
    var normalResults = results.map(v => Object.assign({}, v));
    return normalResults.reduce(function (r, e) {
        return Object.keys(e).forEach(function (k) {
            if (!r[k]) r[k] = e[k]
            else r[k] = r[k].concat(e[k])
        }), r
    }, {})
}

function removeIdFromWavelengths(columns) {
    const index = columns.indexOf('id');
    if (index > -1) {
        columns.splice(index, 1);
    }
    return columns;
}

function removeIdFromAllWavelengths(result) {
    delete result['id'];
    return result;
}

function removeIdFromAllData(result) {
    result.map(element => {
        delete element['id'];
    })
    return result;
}

function delete_file(folderName) {
    try {
        fs.rmSync(folderName, { recursive: true })
    } catch (err) {
        console.log("err", err);
    }
}

function getMeasurmentName(id, name) {
    return id.toString() + '_' + name
}

module.exports = router;
