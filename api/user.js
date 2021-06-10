const router = require('express').Router({ mergeParams: true });
const user_controller = require("../controllers/user_controller");
const { authJwt } = require("../middleware");

router.post(
    "/:id",
    [authJwt.isAdmin],
    toggleAdmin
);

router.get(
    "/",
    [authJwt.isAdmin],
    get_users
);

router.get(
    "/:id",
    [authJwt.isAdmin],
    get_user
);

router.delete(
    "/:id",
    [authJwt.isAdmin],
    delete_user
);

function get_users(req, res, next) {
    user_controller.get_users().then(
        (result) => {
            return res.status(200).json(result);
        },
        (error) => { return res.status(500).send(error) }
    )
}

function delete_user(req, res, next) {
    user_controller.get_user(req.params.id).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Gebruiker is niet gevonden" });
            }
            user_controller.delete_user(req.params.id).then(
                (_) => {
                    return res.status(200).send({ message: `Gebruiker ${result[0].username} is succesvol verwijderd` });
                },
                (error) => { return res.status(500).send(error) }
            )
        },
        (error) => { return res.status(500).send(error) }
    )
}

function get_user(req, res, next) {
    user_controller.get_user(req.params.id).then(
        (result) => {
            if (result.length < 1) {
                return res.status(404).json({ message: "Gebruiker is niet gevonden" });
            }
            return res.status(200).json(result[0]);
        },
        (error) => { return res.status(500).send(error) }
    )
}

function toggleAdmin(req, res, next) {
    user_controller.toggle_admin(req.params.id).then(
        (result) => {
            return res.status(200).json(result[0]);
        },
        (error) => { return res.status(500).send(error) }
    )
}

module.exports = router;
