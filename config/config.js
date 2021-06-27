const dotenv = require('dotenv');
dotenv.config({path: `${process.env.NODE_ENV}.env`});

module.exports = {
    port: process.env.PORT,
    email_address: process.env.EMAIL_ADDRESS,
    password: process.env.EMAIL_PASSWORD,
    database: {
        HOST: process.env.HOST,
        USER: process.env.USER,
        PASSWORD: process.env.PASSWORD,
        DB: process.env.DB,
        dialect: process.env.DIALECT,
        pool: {
            max: process.env.MAX,
            min: process.env.MIN,
            acquire: process.env.ACQUIRE,
            idle: process.env.IDLE
        }
    },
    secret: process.env.SECRET
};