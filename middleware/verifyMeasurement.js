const measurementController = require("../controllers/measurementController");
const userController = require("../controllers/userController");
const roleEnum = require('./roleEnum')

const ifMeasurement = (req, res, next) => {
    measurementController.getMeasurement(req.params.id).then(
        (measurement) => {
            console.log(measurement)
            if (!measurement) {
                return res.status(404).json({ message: 'Kon de meting niet vinden!' });
            }
            res.measurement = measurement;
            next();
        },
        (error) => { return res.status(500).send(error) })
}

const isAllowed = (req, res, next) => {
    userController.getUser(req.userId).then(
        (users) => {
            const user = users[0];
            if (user.id !== res.measurement.createdBy && user.isAdmin !== roleEnum.admin) {
                return res.status(404).json({ message: 'Kon de meting niet vinden!' });
            }
            next();
        },
        (error) => { return res.status(500).send(error) })
}

const verifyMeasurement = {
    ifMeasurement: ifMeasurement,
    isAllowed: isAllowed
};

module.exports = verifyMeasurement;