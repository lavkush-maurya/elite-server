// function mailSender which sends an email using the Gmail service through the nodemailer library. The function takes two parameters, email and name, representing the email address and name of the recipient.

const config = require("../config/index");
const nodeMailer = require("nodemailer");
const { google } = require("googleapis");
const customError = require("../helper/customError")
const oauth2Client = new google.auth.OAuth2(config.GOOGLE_API_CLIENT_ID, config.GOOGLE_API_CLIENT_SECRET, config.GOOGLE_REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: config.GOOGLE_API_REFRESH_TOKEN });

const mailSender = async (email, text, subject) => {
   // console.log(email)
   try {
      const accessToken = await oauth2Client.getAccessToken()
      const transport = nodeMailer.createTransport({
         service: "gmail",
         auth: {
            type: "OAuth2",
            user: "ritu198928@gmail.com",
            clientId: config.GOOGLE_API_CLIENT_ID,
            clientSecret: config.GOOGLE_API_CLIENT_SECRET,
            refreshToken: config.GOOGLE_API_REFRESH_TOKEN,
            accessToken: accessToken
         }
      });

      const mailOptions = {
         from: "Elite Fashion <ritu198928@gmail.com>",
         to: email,
         subject: subject,
         html: text
      };

      const result = await transport.sendMail(mailOptions);
      // console.log(result, "RESULT")
      return result;
   } catch (err) {
      throw new customError(400, "Email Send Failed", "email")
   }
}

module.exports = mailSender;