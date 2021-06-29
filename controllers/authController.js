const mail_config = require("../config/mail.config");
const nodemailer = require("nodemailer");
const options = require('../knexfile');
const knex = require("knex")(options);
var bcrypt = require("bcryptjs");

module.exports = {
    login,
    register,
    addResetToken,
    requestResetPassword,
    getUserOfToken,
    updatePassword,
    deleteResetToken,
    deleteAllResetTokens
};

/**
 * Register user with given data
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns result
 */
function register(username, email, password) {
    return knex('users')
        .insert({ username: username, email: email, password: bcrypt.hashSync(password, 8) });
}

/**
 * Add reset token to database
 * @param {number} userId 
 * @param {string} resetToken 
 * @returns result
 */
function addResetToken(userId, resetToken) {
    return knex('reset_token')
        .insert({ user_id: userId, reset_token: resetToken });
}

/**
 * Delete the given reset token from the database
 * @param {string} token 
 * @returns result
 */
function deleteResetToken(token) {
    return knex.from('reset_token')
        .where('reset_token', token)
        .del();
}

/**
 * Delete all reset tokens from the database (only used for testing purposes)
 * @returns result
 */
function deleteAllResetTokens() {
    return knex.from('reset_token')
        .del();
}

/**
 * Get user of the given reset token
 * @param {string} resetToken 
 * @returns array with user
 */
function getUserOfToken(resetToken) {
    return knex.from('reset_token')
        .innerJoin('users', 'reset_token.user_id', 'users.id')
        .select('users.id', 'users.username', 'users.email')
        .where('reset_token.reset_token', resetToken)
        .first();
}

/**
 * Update old password to new password of given user
 * @param {number} id 
 * @param {string} password 
 * @returns result
 */
function updatePassword(id, password) {
    return knex('users')
        .update({ password: bcrypt.hashSync(password, 8) })
        .where('id', id);
}

/**
 * Login
 * @param {string} username 
 * @returns result 
 */
function login(username) {
    return knex.from('users')
        .select('*')
        .where('username', username)
        .first();
}

/**
 * Request a new pasword via the mailserver
 * @param {string} username 
 * @param {string} email 
 * @param {string} resetToken 
 * @returns result
 */
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
                console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            resolve();
        });
    });
}

/**
 * Get mail tranpsorter
 * @returns mail transporter
 */
async function getTransporter() {
    if (process.env.NODE_ENV === 'test') return mail_config.getTestTransporter();
    return mail_config.getTransporter();
}