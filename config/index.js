const dotenv = require("dotenv")
dotenv.config()

const config = {
   PORT: process.env.PORT,
   DB_URL: process.env.DB_URL,
   JWT_SECRET: process.env.JWT_SECRET,
   JWT_EXPIRE: process.env.JWT_EXPIRE,
   SALT_ROUND: parseInt(process.env.SALT_ROUND),
   CLOUD_NAME: process.env.CLOUD_NAME,
   CLOUD_API_KEY: process.env.CLOUD_API_KEY,
   CLOUD_SECRET: process.env.CLOUD_SECRET,
   STRIPE_KEY: process.env.STRIPE_KEY,
   GOOGLE_API_CLIENT_ID: process.env.GOOGLE_API_CLIENT_ID,
   GOOGLE_API_CLIENT_SECRET: process.env.GOOGLE_API_CLIENT_SECRET,
   GOOGLE_API_REFRESH_TOKEN: process.env.GOOGLE_API_REFRESH_TOKEN,
   GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
   CLIENT_URL: process.env.CLIENT_URL,
   ADMIN_APP_URL: process.env.ADMIN_APP_URL
}

module.exports = config;