const router = require('express').Router({ mergeParams: true });
const measurement_controller = require("../controllers/measurement_controller");
const { authJwt } = require("../middleware");
const fs = require('fs');

router.get('/', getAllScans);
router.delete(
    '/:id',
    [authJwt.verifyToken, authJwt.isAdmin],
    deleteScan
);
router.get('/columns/:id', getAllWavelengths);
router.get('/data/:name', getMeasurementData);
router.get('/id/:id', getAllIds);
router.get('/:name', getMeasurement);
router.get('/:name/columns', getAllIdOfWavelength);
router.get('/:name/:id', getAllWavelengthsOfId);

function deleteScan(req, res, next) {
    measurement_controller.get_table_name_of_id(req.params.id).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Measurement not found" });
            }
            delete_file('./uploads/' + req.params.id.toString() + '_' + result[0].name);
            measurement_controller.delete_scan_data_table(req.params.id.toString() + '_' + result[0].name).then(
                (result) => {
                    measurement_controller.delete_scan_from_measurements(req.params.id).then(
                        (result) => {
                            return res.status(200).json(result);
                        },
                        (error) => {
                            return res.status(500).json({ message: error });
                        } 
                    )
                },
                (error) => {
                    return res.status(500).json({ message: error });
                }
            )},
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getAllScans(req, res, next) {
    measurement_controller.get_all_scans().then(
        (result) => {
            return res.status(200).json(result);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getMeasurement(req, res, next) {
    measurement_controller.get_measurement(req.params.name).then(
        (result) => {
            if (result.length > 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.status(404).json({ message: 'Kon de meting niet vinden' })
            }
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getMeasurementData(req, res, next) {
    measurement_controller.get_measurement_data(req.params.name).then(
        (result) => {
            return res.status(200).json(removeIdFromAllData(result));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getAllIdOfWavelength(req, res, next) {
    measurement_controller.get_all_id_of_wavelength(req.params.name, req.query.c).then(
        (result) => {
            return res.status(200).json(result);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getAllWavelengthsOfId(req, res, next) {
    measurement_controller.get_all_wavelengths_of_id(req.params.name, req.params.id).then(
        (result) => {
            return res.status(200).json(removeIdFromAllWavelengths(normalizeResultsSingle(result)));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getAllWavelengths(req, res, next) {
    measurement_controller.get_all_columns_of_measurement(req.params.id).then(
        (result) => {
            return res.status(200).json(removeIdFromWavelengths(normalizeResultsArray(result)['columns']));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getAllIds(req, res, next) {
    measurement_controller.get_all_ids_of_measurement(req.params.id).then(
        (result) => {
            return res.status(200).json(normalizeResultsArray(result)['id']);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
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

module.exports = router;
