const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    USER_API: process.env.USER_API,
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD
};