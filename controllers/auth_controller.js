const db_controller = require('./database_controller');
const mail_config = require("../config/mail.config");
const nodemailer = require("nodemailer");
var bcrypt = require("bcryptjs");

module.exports = {
    login,
    register,
    addResetToken,
    requestResetPassword,
    findUser,
    updatePassword,
    deleteResetToken,
    deleteAllResetTokens
}

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

function deleteAllResetTokens() {
    const sql = "DELETE FROM resettoken;"

    return db_controller.execute_sql(sql)
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

function login(username) {
    const sql = "SELECT * from users WHERE username = ?;"

    return db_controller.execute_sql(sql, [username]);
}

async function requestResetPassword(username, email, resetToken) {
    const transporter = await getTransporter();
    const mailOptions = {
        from: '"AVT Support" <absorptionvisulazationtool@gmail.com>', // sender address
        to: email,
        subject: "Wachtwoord vergeten", // Subject line
        html: mail_config.getMail(username, resetToken)
    };

    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) { reject(err); }
            if (process.env.NODE_ENV === 'test') {
                console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
            }
            resolve();
        })
    })
}

async function getTransporter() {
    if (process.env.NODE_ENV === 'test') {
        return mail_config.getTestTransporter();
    } else {
        return mail_config.getTransporter();
    }
}