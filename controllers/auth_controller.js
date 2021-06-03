const config = require("../config/auth.config");
const db_controller = require('./database_controller');
const nodemailer = require("nodemailer");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

module.exports = {
    login,
    register,
    addResetToken,
    requestResetPassword,
    findUser,
    updatePassword,
}

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "absorptionvisulazationtool@gmail.com",
        pass: "Avtool2021",
    },
});

function register(req, res) {
    const sql = "INSERT INTO users (username, email, password, isAdmin) VALUES (?,?,?,?);"
    const data = [
        req.body.username,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8),
        0
    ];

    db_controller.execute_sql(sql, data).then(user => {
        res.send({ message: "User was registered successfully!" });
    }).catch(err => {
        console.error(err);
        res.status(500).send({ message: err.message });
    });
}

function addResetToken(userId, resettoken) {
    const sql = "INSERT INTO resettoken (userId, resettoken) VALUES (?,?);"

    return db_controller.execute_sql(sql, [userId, resettoken])
}

function findUser(resettoken) {
    const sql = "SELECT u.id, u.username, u.email FROM resettoken r inner join users u on r.userId = u.id WHERE r.resettoken = ?;"

    return db_controller.execute_sql(sql, [resettoken])
}

function updatePassword(id, password) {
    const sql = "UPDATE users SET password = ? WHERE id = ?;";
    const data = [
        bcrypt.hashSync(password, 8),
        id
    ];

    return db_controller.execute_sql(sql, data)
}

function login(req, res) {
    const sql = "SELECT * from users WHERE username = ?;"

    db_controller.execute_sql(sql, [req.body.username]).then(users => {
        if (users.length == 0) {
            return res.status(404).send({ message: "De combinatie van gebruikersnaam en wachtwoord is niet correct!" });
        } else if (users.length > 1) {
            return res.status(500).send({ message: "Er is een probleem opgetreden." });
        }

        const user = users[0]
        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "De combinatie van gebruikersnaam en wachtwoord is niet correct!"
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
            createdAt: user.createdAt,
            accessToken: token
        });
    });
}

function requestResetPassword(username, email, resetToken) {
    const mailOptions = {
        from: '"AVT Support" <absorptionvisulazationtool@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Wachtwoord vergeten", // Subject line
        text: "Beste " + username + ", \n\n " + // plain text body
            'Je ontvangt deze mail omdat jij (of iemand anders) heeft aangevraagd om je wachtwoord te resetten voor je account. \n\n' +
            'Klik alstublieft om onderstaande link of plak deze in je browser om dit proces af te ronden.\n\n' +
            'http://localhost:4200/reset/' + resetToken + '\n\n' +
            'Als je dit niet aangevraagd heb kun je deze mail negeren en wordt je wachtwoord niet gewijzigd.'
    };

    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) { reject(err); }
            resolve();
        })
    })

}