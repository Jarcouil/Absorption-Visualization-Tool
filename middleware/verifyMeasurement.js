const measurementController = require("../controllers/measurementController");
const userController = require("../controllers/userController");
const roleEnum = require('./roleEnum');

/**
 * Validate if measurement of given id exists
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const ifMeasurement = async (req, res, next) => {
    try {
        const measurement = await measurementController.getMeasurement(req.params.id);
        if (!measurement) return res.status(404).json({ message: 'Kon de meting niet vinden!' });
        res.measurement = measurement;
        next();     
    } catch (error) { return res.status(500).send(error);}
};

/**
 * Validate if user is allowed to access the given measurement
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isAllowed = async (req, res, next) => {
    try {
        const user = await userController.getUser(req.userId);
        if (user.id !== res.measurement.createdBy && user.isAdmin !== roleEnum.admin) {
            return res.status(404).json({ message: 'Kon de meting niet vinden!' });
        }
        next();
    } catch (error) { return res.status(500).send(error);}
};

const verifyMeasurement = {
    ifMeasurement: ifMeasurement,
    isAllowed: isAllowed
};

module.exports = verifyMeasurement;