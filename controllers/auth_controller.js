const mail_config = require("../config/mail.config");
const nodemailer = require("nodemailer");
const knex = require('../knex');
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
    return knex('users')
        .insert({ username: username, email: email, password: bcrypt.hashSync(password, 8) })
}

function addResetToken(userId, resetToken) {
    return knex('reset_token')
        .insert({ user_id: userId, reset_token: resetToken })
}

function deleteResetToken(token) {
    return knex.from('reset_token')
        .where('reset_token', token)
        .del()
}

function deleteAllResetTokens() {
    return knex.from('reset_token')
        .del()
}

function findUser(resetToken) {
    return knex.from('reset_token')
        .innerJoin('users', 'reset_token.user_id', 'users.id')
        .select('users.id', 'users.username', 'users.email')
        .where('reset_token.reset_token', resetToken)
}

function updatePassword(id, password) {
    return knex('users')
        .update({ password: bcrypt.hashSync(password, 8) })
        .where('id', id)
}

function login(username) {
    return knex.from('users')
        .select('*')
        .where('username', username)
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