const router = require('express').Router({ mergeParams: true });
const measurement_controller = require("../controllers/measurement_controller");

router.get('/', getAllScans);
router.delete('/:id', deleteScan);
router.get('/columns/:id', getAllColumns);
router.get('/id/:id', getAllIds);
router.get('/:name', getMeasurement);
router.get('/:name/columns', getColumnsOfMeasurements);
router.get('/:name/:id', getWavelengthOfId);

function deleteScan(req, res, next) {
    measurement_controller.delete_scan(req.params.id).then(
        (result) => {
            return res.status(200).json(result);
        },
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
            return res.status(200).json(result);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getColumnsOfMeasurements(req, res, next) {
    measurement_controller.get_columns_of_measurement(req.params.name, req.query.c).then(
        (result) => {
            return res.status(200).json(normalizeResults(result));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getWavelengthOfId(req, res, next) {
    measurement_controller.get_wavelengths_of_id(req.params.name, req.params.id).then(
        (result) => {
            return res.status(200).json(normalizeResults(result));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getAllColumns(req, res, next) {
    measurement_controller.get_all_columns_of_measurement(req.params.id).then(
        (result) => {
            return res.status(200).json(removeIdFromColumns(normalizeResults(result)['columns']));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getAllIds(req, res, next) {
    measurement_controller.get_all_ids_of_measurement(req.params.id).then(
        (result) => {
            return res.status(200).json(normalizeResults(result)['id']);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function normalizeResults(results) {
    var normalResults = results.map(v => Object.assign({}, v));

    return normalResults.reduce(function (r, e) {
        return Object.keys(e).forEach(function (k) {
            if (!r[k]) r[k] = [].concat(e[k])
            else r[k] = r[k].concat(e[k])
        }), r
    }, {})
}

function removeIdFromColumns(columns) {
    columns.shift();
    return columns;
}

module.exports = router;
