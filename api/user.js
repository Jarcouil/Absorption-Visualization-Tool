const router = require('express').Router({ mergeParams: true });
const userController = require("../controllers/userController");
const { authJwt } = require("../middleware");
const { verifyUser } = require("../middleware");

router.post(
    "/:id",
    [authJwt.isAdmin, verifyUser.ifUser],
    toggleAdmin
);

router.get(
    "/",
    [authJwt.isAdmin],
    getUsers
);

router.get(
    "/:id",
    [authJwt.isAdmin, verifyUser.ifUser],
    getUser
);

router.delete(
    "/:id",
    [authJwt.isAdmin, verifyUser.ifUser],
    deleteUser
);

/**
 * Get all users
 * @param {*} req 
 * @param {*} res 
 * @param {*} next
 * @returns users
 */
async function getUsers(req, res, next) {
    try {
        const users = await userController.getUsers(req.query?.sort, req.query?.order, req.query?.page, req.query?.perPage);
        if (users.data.length < 1) {
            return res.status(404).json({ message: "Er zijn geen gebruikers gevonden" });
        }
        return res.status(200).json(users);
    } catch (error) { return res.status(500).send(error); }

}

/**
 * Delete user with given id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id id
 */
async function deleteUser(req, res, next) {
    try {
        await userController.deleteUser(req.params.id);
        return res.status(200).send({ message: `Gebruiker ${res.user.username} is succesvol verwijderd` });
    } catch (error) { return res.status(500).send(error); }
}

/**
 * Get user with given id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id id
 * @return user
 */
function getUser(req, res, next) {
    return res.status(200).json(res.user);
}

/**
 * Toggle admin rights for user with given id
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @param {*} req.params.id id
 */
async function toggleAdmin(req, res, next) {
    try {
        await userController.toggleAdmin(req.params.id);
        return res.status(200).json({ message: `Gebruiker ${res.user.username} zijn admin rechten zijn succesvol gewijzigd.` });

    } catch (error) { return res.status(500).send(error); }
}

module.exports = router;
