const dotenv = require("dotenv");
dotenv.config({ path: `${process.env.NODE_ENV}.env` });

module.exports = {
  port: process.env.PORT,
  email_address: process.env.EMAIL_ADDRESS,
  password: process.env.EMAIL_PASSWORD,
  frontendUrl: process.env.FRONTEND_URL,
  database: {
    HOST: process.env.HOST,
    USER: process.env.DBUSER,
    PASSWORD: process.env.PASSWORD,
    DB: process.env.DB,
    dialect: process.env.DIALECT,
    pool: {
      max: process.env.MAX,
      min: process.env.MIN,
      acquire: process.env.ACQUIRE,
      idle: process.env.IDLE,
    },
  },
  python: process.env.PYTHON,
  secret: process.env.SECRET,
  users: {
    admin: {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      email: process.env.ADMIN_EMAIL,
    },
    user: {
      username: process.env.USER_USERNAME,
      password: process.env.USER_PASSWORD,
      email: process.env.USER_EMAIL,
    },
  },
};
