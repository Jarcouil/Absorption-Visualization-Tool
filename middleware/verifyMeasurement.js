const measurementController = require("../controllers/measurementController");
const userController = require("../controllers/userController");
const roleEnum = require('./roleEnum')

/**
 * Validate if measurment of given id exists
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const ifMeasurement = (req, res, next) => {
    measurementController.getMeasurement(req.params.id).then(
        (measurement) => {
            if (!measurement) return res.status(404).json({ message: 'Kon de meting niet vinden!' });
            res.measurement = measurement;
            next();
        },
        (error) => { return res.status(500).send(error); })
}

/**
 * Validate if user is allowed to access the given measurment
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isAllowed = (req, res, next) => {
    userController.getUser(req.userId).then(
        (user) => {
            if (user.id !== res.measurement.createdBy && user.isAdmin !== roleEnum.admin) {
                return res.status(404).json({ message: 'Kon de meting niet vinden!' });
            }
            next();
        },
        (error) => { return res.status(500).send(error); })
}

const verifyMeasurement = {
    ifMeasurement: ifMeasurement,
    isAllowed: isAllowed
};

module.exports = verifyMeasurement;