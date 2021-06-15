const measurement_controller = require("../controllers/measurement_controller");
const user_controller = require("../controllers/user_controller");
const roleEnum = require('./roleEnum')

const verifyUser = (req, res, next) => {
    user_controller.get_user(req.userId).then(users => {
        const user = users[0];
        measurement_controller.get_measurement(req.params.id).then(
            (measurements) => {
                // check if there are measurements
                if (measurements.length < 1) {
                    return res.status(404).json({ message: 'Kon de meting niet vinden!' });
                }
                // check if measurement is not created by user and does not have an admin role 
                if (user.id !== measurements[0].createdBy && user.isAdmin !== roleEnum.admin) {
                    return res.status(404).json({ message: 'Kon de meting niet vinden!' });
                }
                res.measurement = measurements[0];
                next();
            }, 
            (error) => { return res.status(500).send(error) })
    },
    (error) => { return res.status(500).send(error) })
}

const verifyMeasurement = {
    verifyUser: verifyUser,
};

module.exports = verifyMeasurement;