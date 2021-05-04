const config = require("../config/auth.config");
const db_controller = require('./database_controller');

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

module.exports = {
    login,
    register,
}

function register(req, res) {
    const sql = "INSERT INTO users (username, email, password, isAdmin) VALUES (?,?,?,?);"
    const data = [
        req.body.username,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8),
        req.body.isAdmin
    ];

    db_controller.execute_sql(sql, data).then(user => {
        res.send({ message: "User was registered successfully!" });
    }).catch(err => {
        console.error(err);
        res.status(500).send({ message: err.message });
    });
}

function login(req, res) {
    const sql = "SELECT * from users WHERE username = ?;"

    db_controller.execute_sql(sql, [req.body.username]).then(users => {
        if (users.length == 0) {
            return res.status(404).send({ message: "User Not found." });
        } else if (users.length > 1) {
            return res.status(500).send({ message: "There has been an error." });
        }

        const user = users[0]
        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin,
            created_at: user.created_at,
            accessToken: token
        });
    });
}