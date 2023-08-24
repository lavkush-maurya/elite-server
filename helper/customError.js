/********************************************************
 * @CustomError
 * @Description This class extends the built-in Error class, which allows to create error types that will have the same behavior as the built-in error types.
 * @Parameters status code, error message
 * @Return error object
 *********************************************************/

class CustomError extends Error {
   constructor(code, message, name = "name") {
      super(message);
      this.code = code;
      this.name = name
   }
}
module.exports = CustomError;