const db_controller = require('./database_controller');
const nodemailer = require("nodemailer");
const mailTemplate = require("../config/mail.template");
const mailConfig = require("../config/config.json");
var bcrypt = require("bcryptjs");

module.exports = {
    login,
    register,
    addResetToken,
    requestResetPassword,
    findUser,
    updatePassword,
    deleteResetToken
}

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 465,
    secure: true,
    auth: {
        user: mailConfig["email-addres"],
        pass: mailConfig["password"],
    },
});

function register(username, email, password) {
    const sql = "INSERT INTO users (username, email, password) VALUES (?,?,?);"
    const data = [username, email, bcrypt.hashSync(password, 8)];

    return db_controller.execute_sql(sql, data);
}

function addResetToken(userId, resettoken) {
    const sql = "INSERT INTO resettoken (userId, resettoken) VALUES (?,?);"

    return db_controller.execute_sql(sql, [userId, resettoken])
}

function deleteResetToken(token) {
    const sql = "DELETE FROM resettoken WHERE resettoken = ?;"

    return db_controller.execute_sql(sql, [token])
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

    console.log(sql)
    console.log(data)
    return db_controller.execute_sql(sql, data)
}

function login(username) {
    const sql = "SELECT * from users WHERE username = ?;"

    console.log("type of username = " + typeof username)

    return db_controller.execute_sql(sql, [username]);
}

function requestResetPassword(username, email, resetToken) {
    const mailOptions = {
        from: '"AVT Support" <absorptionvisulazationtool@gmail.com>', // sender address
        to: email,
        subject: "Wachtwoord vergeten", // Subject line
        html: mailTemplate.getMail(username, resetToken)
    };

    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) { reject(err); }
            resolve();
        })
    })

}