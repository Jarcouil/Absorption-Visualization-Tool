const userController = require("../controllers/userController");

const ifUser = (req, res, next) => {
    userController.getUser(req.params.id).then(
        (user) => {
            if (!user) {
                return res.status(404).json({ message: "Gebruiker is niet gevonden" });
            }
            res.user = user;
            next();
        },
        (error) => { return res.status(500).send(error) })
}


const verifyuser = {
    ifUser: ifUser,
};

module.exports = verifyuser;