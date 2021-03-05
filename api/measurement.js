const router = require('express').Router({mergeParams: true});
const measurement_controller = require("../controllers/measurement_controller");

router.get('/', getAllScans);
router.get('/:name', getMeasurement);
router.get('/:name/:columns', getColumnsOfMeasurements);

function getAllScans(req, res, next){
    measurement_controller.get_all_scans().then(
        (result) => {
            return res.status(200).json(result);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getMeasurement(req, res, next){
    measurement_controller.get_measurement(req.params.name).then(
        (result) => {
            return res.status(200).json(normalizeResults(result));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function getColumnsOfMeasurements(req, res, next){
    measurement_controller.get_columns_of_measurement(req.params.name, req.query.c).then(
        (result) => {
            return res.status(200).json(normalizeResults(result));
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function normalizeResults(results){
    var normalResults = results.map(v => Object.assign({}, v));

    return normalResults.reduce(function(r, e) {
        return Object.keys(e).forEach(function(k) {
            if(!r[k]) r[k] = [].concat(e[k])
            else r[k] = r[k].concat(e[k])
        }), r
        }, {})
}

module.exports = router;
