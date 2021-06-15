const measurement_controller = require("../controllers/measurement_controller");
const user_controller = require("../controllers/user_controller");
const roleEnum = require('./roleEnum')

const ifMeasurements = (req, res, next) => {
    measurement_controller.get_measurement(req.params.id).then(
        (measurements) => {
            if (measurements.length < 1) {
                console.log('No measurements')
                return res.status(404).json({ message: 'Kon de meting niet vinden!' });
            }
            res.measurements = measurements;
            next();
        },
        (error) => { return res.status(500).send(error) })
}

const isAllowed = (req, res, next) => {
    user_controller.get_user(req.userId).then(
        (users) => {
            const user = users[0];
            if (user.id !== res.measurements[0].createdBy && user.isAdmin !== roleEnum.admin) {
                console.log('No rights')
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