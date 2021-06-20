const router = require('express').Router({ mergeParams: true });
const authController = require("../controllers/authController");
const { verifySignUp } = require("../middleware");
const { verifyLogin } = require("../middleware")
const userController = require("../controllers/userController");
const crypto = require('crypto');
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

router.post(
    '/login',
    verifyLogin.checkParameters,
    login
);
router.post(
    '/reset',
    verifySignUp.checkValidEmail,
    requestResetPassword
)
router.post('/new-password', newPassword)
router.post('/reset-valid', validResetPassword)
router.post(
    '/register',
    [
        verifySignUp.checkParameters,
        verifySignUp.checkDuplicateEmail,
        verifySignUp.checkDuplicateUsername,
        verifySignUp.checkRolesExisted,
        verifySignUp.checkValidEmail,
        verifySignUp.checkPasswordLength
    ],
    register);

/**
 * Validate login credentials and respond accordingly
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.body.username username 
 * @param {*} req.body.password password 
 */
function login(req, res, next) {
    const username = req.body.username
    authController.login(username).then(
        (user) => {
            if (!user) {
                return res.status(401).send({ message: "De combinatie van gebruikersnaam en wachtwoord is niet correct!" });
            }

            const passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "De combinatie van gebruikersnaam en wachtwoord is niet correct!"
                });
            } else {
                const token = jwt.sign({ id: user.id }, config.secret, {
                    expiresIn: 60 * 60 // 1 hour
                });

                return res.status(200).send({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.is_admin,
                    createdAt: user.created_at,
                    accessToken: token
                });
            }
        },
        (error) => { res.status(500).send({ message: error.message }); }
    )
}

/**
 * Register new user
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.body.username username
 * @param {*} req.body.email    email
 * @param {*} req.body.password password
 */
function register(req, res, next) {
    authController.register(req.body.username, req.body.email, req.body.password).then(
        (result) => {
            return res.send({ message: "Account is succesvol geregistreerd!" });
        },
        (error) => { res.status(500).send({ message: error.message }); }
    )
}

/**
 * Validate given token to reset the password
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.body.resetToken resetToken 
 */
function validResetPassword(req, res, next) {
    if (!req.body.resetToken) {
        return res.status(400).json({ error: 'Token is verplicht' });
    }

    authController.getUserOfToken(req.body.resetToken).then(
        (tokens) => {
            if (tokens.length < 1) {
                return res.status(404).json({ message: "Token is niet geldig" });
            }
            return res.status(200).json({ message: "Token is geldig." })
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Set new password if token is valid
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.body.resetToken resetToken 
 * @param {*} req.body.password password
 */
function newPassword(req, res, next) {
    if (!req.body.resetToken) {
        return res.status(400).json({ error: 'Token is verplicht' });
    }

    authController.getUserOfToken(req.body.resetToken).then(
        (user) => {
            if (!user) {
                return res.status(404).json({ message: "Token is niet geldig" });
            }
            authController.updatePassword(user.id, req.body.password).then(
                (result) => {
                    authController.deleteResetToken(req.body.resetToken).then(
                        (result) => {
                            return res.status(200).json({ message: "Wachtwoord succesvol gewijzigd" })
                        },
                        (error) => { return res.status(500).json({ message: error }); 
                    });
                },
                (error) => { return res.status(500).json({ message: error }); }
            )
        },
        (error) => { return res.status(500).send(error) }
    )
}

/**
 * Request an email to reset the password of account
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.body.email email
 */
async function requestResetPassword(req, res, next) {
    userController.getUserByEmail(req.body.email).then(
        (user) => {
            if (!user) {
                return res.status(404).json({ message: "Email niet gevonden!" });
            }
            const resetToken = crypto.randomBytes(16).toString('hex');

            authController.addResetToken(user.id, resetToken).then(
                    (result) => {
                        authController.requestResetPassword(user.username, user.email, resetToken).then(
                            (result) => {
                                return res.status(200).json({ message: "Mail is succesvol verzonden." })
                            },
                            (error) => { return res.status(500).json({ message: error }); }
                        )
                    },
                    (error) => { return res.status(500).json({ message: error }); }
                )
        },
        (error) => { return res.status(500).send(error) }
    )
}

module.exports = router;
