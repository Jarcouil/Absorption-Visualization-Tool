const router = require('express').Router({ mergeParams: true });
const auth_controller = require("../controllers/auth_controller");
const { verifySignUp } = require("../middleware");
const { authJwt } = require("../middleware");
const user_controller = require("../controllers/user_controller");
const crypto = require('crypto');

router.post('/login', login);
router.post('/reset', requestResetPassword)
router.post('/new-password', newPassword)
router.post('/reset-valid', validResetPassword)
router.post(
    '/register',
    [
        verifySignUp.checkDuplicateUsernameOrEmail,
        verifySignUp.checkRolesExisted,
    ],
    register);

function login(req, res, next) {
    return auth_controller.login(req, res)
}

function register(req, res, next) {
    return auth_controller.register(req, res)
}

function validResetPassword(req, res, next) {
    if (!req.body.resetToken) {
        return res.status(400).json({ error: 'Token is verplicht' });
    }

    auth_controller.findUser(req.body.resetToken).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Token is niet geldig" });
            }
            console.log(result)
            return res.status(200).json({ message: "Token is geldig." })
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function newPassword(req, res, next) {
    if (!req.body.resetToken) {
        return res.status(400).json({ error: 'Token is verplicht' });
    }

    auth_controller.findUser(req.body.resetToken).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Token is niet geldig" });
            }
            const user = result[0];
            // console.log(result)
            auth_controller.updatePassword(user.id, req.body.password).then(
                (result) => {
                    auth_controller.deleteResetToken(req.body.resetToken).then(
                        (result) => {
                            return res.status(200).json({ message: "Wachtwoord succesvol gewijzigd" })
                        },
                        (error) => {
                            return res.status(500).json({ message: error });

                        });
                },
                (error) => {
                    return res.status(500).json({ message: error });

                }
            )
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function requestResetPassword(req, res, next) {
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email is verplicht' });
    }

    user_controller.get_user_by_email(req.body.email).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Email niet gevonden" });
            }
            const user = result[0];
            const resetToken = crypto.randomBytes(16).toString('hex');

            auth_controller.addResetToken(user
                .id, resetToken).then(
                    (result) => {
                        auth_controller.requestResetPassword(user.username, user.email, resetToken).then(
                            (result) => {
                                return res.status(200).json({ message: "Wachtwoord reset succesvol aangevraagd." })
                            },
                            (error) => {
                                return res.status(500).json({ message: error });
                            }
                        )

                    },
                    (error) => {
                        return res.status(500).json({ message: error });
                    }
                )
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

module.exports = router;
