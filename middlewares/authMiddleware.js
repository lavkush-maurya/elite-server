const config = require("../config/index");
const jwt = require("jsonwebtoken");
const User = require("../models/user.schema");

/****************************************************************************
 * @description Middleware to check if the request is authenticated.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @param {Function} next The next middleware function.
 * @return {Object} Returns a 401 or 403 response if the token is invalid or there is an error in decoding the JWT.
 *****************************************************************************/
module.exports.isAuthenticated = async (req, res, next) => {
   try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
         token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies && req.cookies.token) {
         token = req.cookies.token;
      }
      // console.log(token, "TOKEN FRESH")
      if (!token) {
         return res.status(401).json({
            success: false,
            message: "You are not authorized",
         });
      }

      const decodedJwtPayload = jwt.verify(token, config.JWT_SECRET);
      // console.log(decodedJwtPayload)
      const user = await User.findById(decodedJwtPayload._id, "name _id role email");

      if (!user) {
         return res.status(401).json({
            success: false,
            message: "You are not authorized",
         });
      }

      req.user = user;

      next();
   } catch (err) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
   }
};
