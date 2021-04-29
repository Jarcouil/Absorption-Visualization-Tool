const router = require('express').Router({ mergeParams: true });
const user_controller = require("../controllers/user_controller");
const { authJwt } = require("../middleware");

router.get(
    "/",
    [authJwt.verifyToken, authJwt.isAdmin],
    get_users
);

router.get(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    get_user
);

router.delete(
    "/:id",
    [authJwt.verifyToken, authJwt.isAdmin],
    delete_user
);

function get_users(req, res, next) {
    user_controller.get_users().then(
        (result) => {
            return res.status(200).json(result);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function delete_user(req, res, next) {
    user_controller.delete_user(req.params.id).then(
        (result) => {
            return res.status(200).json(result);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

function get_user(req, res, next) {
    user_controller.get_user(req.params.id).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(result[0]);
        },
        (error) => {
            return res.status(500).json({ message: error });
        }
    )
}

module.exports = router;
