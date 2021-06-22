/**
 * Check if all parameters are present.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const checkParameters = (req, res, next) => {
    if (!req.body.username) return res.status(400).json({ message: "Gebruikersnaam is verplicht!" });
    if (!req.body.password) return res.status(400).json({ message: "Wachtwoord is verplicht!" });
    next();
}

const verifyLogin = {
    checkParameters: checkParameters,
};

module.exports = verifyLogin;