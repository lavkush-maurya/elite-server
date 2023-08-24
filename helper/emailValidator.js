/********************************************************
 * @isValidEmail
 * @Description Email validation helper function to validate the format of an email address.
 * @Parameters email
 * @Return boolen
 *********************************************************/

const isValidEmail = (email) => {
   const regx = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
   if (email.match(regx)) {
      return true;
   }
   return false;
}

module.exports = isValidEmail;