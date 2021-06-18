const measurementController = require("../controllers/measurementController");
const userController = require("../controllers/userController");
const roleEnum = require('./roleEnum')

const ifMeasurements = (req, res, next) => {
    measurementController.getMeasurement(req.params.id).then(
        (measurements) => {
            if (measurements.length < 1) {
                return res.status(404).json({ message: 'Kon de meting niet vinden!' });
            }
            res.measurements = measurements;
            next();
        },
        (error) => { return res.status(500).send(error) })
}

const isAllowed = (req, res, next) => {
    userController.getUser(req.userId).then(
        (users) => {
            const user = users[0];
            if (user.id !== res.measurements[0].createdBy && user.isAdmin !== roleEnum.admin) {
                return res.status(404).json({ message: 'Kon de meting niet vinden!' });
            }
            next();
        },
        (error) => { return res.status(500).send(error) })
}

const verifyMeasurement = {
    ifMeasurements: ifMeasurements,
    isAllowed: isAllowed
};

module.exports = verifyMeasurement;