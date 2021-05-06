const router = require('express').Router({ mergeParams: true });
const auth_controller = require("../controllers/auth_controller");
const { verifySignUp } = require("../middleware");
const { authJwt } = require("../middleware");

router.post('/login', login);
router.post(
    '/register',
    [
        verifySignUp.checkDuplicateUsernameOrEmail,
        verifySignUp.checkRolesExisted,
        authJwt.verifyToken, 
        authJwt.isAdmin,
    ],
    register);

function login(req, res, next) {
    return auth_controller.login(req, res)
}

function register(req, res, next) {
    return auth_controller.register(req, res)
}

module.exports = router;
