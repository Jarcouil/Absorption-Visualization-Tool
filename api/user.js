const router = require('express').Router({ mergeParams: true });
const user_controller = require("../controllers/user.controller");
const { authJwt } = require("../middleware");

router.get("/all", user_controller.allAccess);
router.get(
    "/user",
    [authJwt.verifyToken],
    user_controller.userBoard
);
router.get(
    "/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    user_controller.moderatorBoard
);
router.get(
    "/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    user_controller.adminBoard
);

module.exports = router;
