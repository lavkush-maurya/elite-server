const { Schema, model } = require("mongoose");
const authRoles = require("../utils/authRoles")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const config = require("../config/index")

const userSchema = new Schema({
   name: {
      type: String,
      maxlength: [30, "Max Length should be less then 30 Characters"],
      minLenght: [4, "Minimum Length should be more then 4 Characters"],
      required: [true, "Name is Required"],
      trim: true
   },
   email: {
      type: String,
      required: [true, "Email is Required"],
      unique: true,
      trim: true
   },
   password: {
      type: String,
      required: [true, "Password is Required"],
      minlength: [8, "Password should be more then 8 Characters"]
   },
   role: {
      type: String,
      enum: Object.values(authRoles),
      default: authRoles.USER
   },
   purchases: {
      type: Array,
      default: [],
   },
   phone: {
      type: String,
      minlength: [10, "Phone Number should be more then 10 Digits"]
   },
   city: {
      type: String
   },
   address: {
      type: String
   },
   image: {
      type: String,
   },
   imageId: {
      type: String
   },
   forgetPasswordToken: String,
   forgetPasswordExpiry: Date
},
   {
      timestamps: true
   }
);

// encrypt password before saving to DB.
userSchema.pre("save", async function (next) {
   if (!this.isModified()) {
      return next()
   }
   this.password = await bcrypt.hash(this.password, config.SALT_ROUND)
   next()
})

//Methods to add more featuers in the Schema
userSchema.methods = {
   //Compare Password 
   comparePassword: async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password)
   },

   //Generate JWT token
   generateJwtToken: function () {
      return jwt.sign(
         {
            _id: this._id,
            role: this.role
         },
         config.JWT_SECRET,
         {
            expiresIn: "72h"
         }

      )
   },

   //Generate Forget Password Token
   generateForgetPassToken: function () {
      const forgetToken = crypto.randomBytes(20).toString("hex");
      this.forgetPasswordToken = crypto
         .createHash("sha256")
         .update(forgetToken)
         .digest("hex")

      this.forgetPasswordExpiry = Date.now() + 20 * 60 * 1000
      return forgetToken;
   }
}

const User = model("User", userSchema);

module.exports = User;