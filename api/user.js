const router = require('express').Router({ mergeParams: true });
const userController = require("../controllers/userController");
const { authJwt } = require("../middleware");

router.post(
    "/:id",
    [authJwt.isAdmin],
    toggleAdmin
);

router.get(
    "/",
    [authJwt.isAdmin],
    getUsers
);

router.get(
    "/:id",
    [authJwt.isAdmin],
    getUser
);

router.delete(
    "/:id",
    [authJwt.isAdmin],
    deleteUser
);

function getUsers(req, res, next) {
    userController.getUsers(req.query?.sort, req.query?.order).then(
        (users) => {
            if (users.length < 1) {
                return res.status(404).json({ message: "Er zijn geen gebruikers gevonden" });
            }
            return res.status(200).json(users);
        },
        (error) => { return res.status(500).send(error) }
    )
}

function deleteUser(req, res, next) {
    userController.getUser(req.params.id).then(
        (users) => {
            if (users.length < 1) {
                return res.status(404).json({ message: "Gebruiker is niet gevonden" });
            }
            userController.deleteUser(req.params.id).then(
                (result) => {
                    return res.status(200).send({ message: `Gebruiker ${users[0].username} is succesvol verwijderd` });
                },
                (error) => { return res.status(500).send(error) }
            )
        },
        (error) => { return res.status(500).send(error) }
    )
}

function getUser(req, res, next) {
    userController.getUser(req.params.id).then(
        (users) => {
            if (users.length < 1) {
                return res.status(404).json({ message: "Gebruiker is niet gevonden" });
            }
            return res.status(200).json(users[0]);
        },
        (error) => { return res.status(500).send(error) }
    )
}

function toggleAdmin(req, res, next) {
    userController.getUser(req.params.id).then(
        (users) => {
            if (users.length < 1) {
                return res.status(404).json({ message: "Gebruiker is niet gevonden" });
            }
            userController.toggleAdmin(req.params.id).then(
                (result) => {
                    
                    return res.status(200).json({ message: `Gebruiker ${users[0].username} zijn admin rechten zijn succesvol gewijzigd.` });
                },
                (error) => { return res.status(500).send(error) }
            )
        },
        (error) => { return res.status(500).send(error) }
        )
}

module.exports = router;
