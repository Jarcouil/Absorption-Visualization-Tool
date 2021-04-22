const router = require('express').Router({ mergeParams: true });
const auth_controller = require("../controllers/auth.controller");
const { verifySignUp } = require("../middleware");

router.post('/login', login);
router.post(
    '/register',
    [
        verifySignUp.checkDuplicateUsernameOrEmail,
        verifySignUp.checkRolesExisted
    ],
    register);

function login(req, res, next) {
    return auth_controller.login(req, res)
}

function register(req, res, next) {
    return auth_controller.register(req, res)
}

module.exports = router;
