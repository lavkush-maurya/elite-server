const crypto = require("crypto");
const CustomError = require("../helper/customError");
const User = require("../models/user.schema");
const isValidEmail = require("../helper/emailValidator");
const cookieOptions = require("../utils/cookieOptions");
const errorResponse = require("../helper/errorResponse");
const mailSender = require("../helper/mailSender");
const config = require("../config/index");

/**********************************************************
 * Create a new user Controller.
 * @route POST /api/v1/auth/signup
 * @param {string} firstName.required - User's first name
 * @param {string} lastName.required - User's last name
 * @param {string} email.required - User's email address
 * @param {string} password.required - User's password
 * @returns {object} 200 - User object
 * @throws {CustomError} 400 - All the input fields are mandatory
 * @throws {CustomError} 400 - Invalid email
 * @throws {CustomError} 400 - User already exists with this email
 * @throws {CustomError} 400 - Password should be more than 8 characters
 * @throws {CustomError} 400 - Password and Confirm Password does not match
 * @throws {CustomError} 500 - Internal server error
 ***************************************************************/
exports.signUp = async (req, res) => {
	try {
		const { firstName, lastName, email, password, confirmPassword } = req.body;

		if (!firstName || !lastName || !email || !password || !confirmPassword) {
			throw new CustomError(400, 'All the input fields are mandatory');
		}

		if (!isValidEmail(email)) {
			throw new CustomError(400, 'Invalid email', 'email');
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			throw new CustomError(400, 'User already exists with this email');
		}

		if (password.length < 8) {
			throw new CustomError(400, 'Password should be more than 8 characters', 'password');
		}

		if (password !== confirmPassword) {
			throw new CustomError(400, 'Password and Confirm Password does not match', 'confirmPassword');
		}

		const name = `${firstName} ${lastName}`;
		const user = await User.create({ name, email, password });

		user.password = undefined;
		const token = user.generateJwtToken();
		const userPayload = { _id: user._id, name, role: user.role, email: user.email };
		res.cookie('token', token, cookieOptions);
		res.status(200).json({ success: true, userPayload, token });
	} catch (err) {
		errorResponse(res, err, 'SIGNUP');
	}
};

/******************************************************************
 * User login Controller.
 * @route POST /api/v1/auth/login
 * @param {string} email.required - User's email address
 * @param {string} password.required - User's password
 * @returns {object} 200 - User object and JWT Token
 * @throws {CustomError} 400 - All the input fields are mandatory
 * @throws {CustomError} 401 - Invalid Credentials
 * @throws {CustomError} 500 - Internal server error
 ******************************************************************/
module.exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new CustomError(400, "All the input fields are mandatory");
		}

		const user = await User.findOne({ email });
		if (!user) {
			throw new CustomError(401, "Invalid Credentials");
		}

		const isPasswordMatch = await user.comparePassword(password);
		if (!isPasswordMatch) {
			throw new CustomError(401, "Invalid Credentials");
		}

		user.password = undefined;
		const token = user.generateJwtToken();
		const userPayload = {
			_id: user._id,
			name: user.name,
			role: user.role,
			email: user.email,
			profilePic: user?.image
		};
		res.cookie("token", token, cookieOptions);
		res.status(200).json({ success: true, userPayload, token });
	} catch (err) {
		errorResponse(res, err, "LOGIN");
	};
};

/*************************************************************************
 * Only admin can login using this route.
 * @route POST /api/v1/admin/login
 * @param {string} email.required - User's email address
 * @param {string} password.required - User's password
 * @returns {object} 200 - User object and JWT token
 * @throws {CustomError} 400 - All the input fields are mandatory
 * @throws {CustomError} 401 - Invalid credentials
 * @throws {CustomError} 500 - Internal server error
 **************************************************************************/
module.exports.adminLogin = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			throw new CustomError(400, "All the input fields are mandatory");
		}

		const user = await User.findOne({ email });
		if (!user) {
			throw new CustomError(401, "Invalid credentials");
		}

		if (user.role !== "ADMIN") {
			throw new CustomError(401, "Invalid credentials");
		}

		const isPasswordMatch = await user.comparePassword(password);
		if (!isPasswordMatch) {
			throw new CustomError(401, "Invalid credentials");
		}
		user.password = undefined;
		const token = user.generateJwtToken();
		const userPayload = {
			_id: user._id,
			name: user.name,
			role: user.role,
			email: user.email,
			imageUrl: user.image,
		};
		res.cookie("token", token, cookieOptions);
		res.status(200).json({ success: true, userPayload, token });
	} catch (err) {
		errorResponse(res, err, "LOGIN");
	};
};

/***************************************************************************
 * Generates a forget password token and sends a reset password email to the user's email address.
 * @route POST /api/v1/admin/login
 * @param {string} email.required - User's email address
 * @returns {object} Returns a JSON object with a success property indicating whether the operation was successful and a message property containing a message indicating whether the reset password email has been sent to the user's email address.
 * @throws {CustomError} If the email is invalid, the user is not found, or an error occurred while sending the reset password email.
 *****************************************************************************/
module.exports.forgotPassword = async (req, res) => {
	let user;

	try {
		const { email } = req.body;
		if (!email) {
			throw new CustomError(400, "Invalid Email", "email");
		}
		if (!isValidEmail(email)) {
			throw new CustomError(400, "Invalid Email", "email");
		}

		user = await User.findOne({ email });
		if (!user) {
			throw new CustomError(400, "User not found", "email");
		}

		const resetToken = user.generateForgetPassToken();

		await user.save({ validateBeforeSave: false });

		// const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/forget/password/${resetToken}`;
		const resetUrl = `${config.CLIENT_URL}/reset/password/${resetToken}`;
		const text = `
		 <div style="background-color: #ffffff; padding: 10px;">
			<h1 style="margin-bottom: 15px; color: #212529;">Reset Your Password</h1>
			<p style="font-size: 18px;">Click the link below to reset your password:</p>
			<a style="display: inline-block;
			  padding: 10px 20px;
			  background-color: #3f7fb8;
			  color: #fff;
			  text-decoration: none;
			  border-radius: 5px;" href=${resetUrl}>Reset Password</a>
			<p>If you did not request a password reset, please ignore this email.</p>
		 </div>
	  `;

		// Send email
		await mailSender(user?.email, text, "Reset Your Password - Elite Fashion");

		res.status(200).json({
			success: true,
			message: `Password reset email has been sent to your email ${user.email}`,
		});
	} catch (err) {
		if (user) {
			// Roll back - clear fields and save
			user.forgetPasswordToken = undefined;
			user.forgetPasswordExpiry = undefined;
			await user.save({ validateBeforeSave: false });
		}
		errorResponse(res, err, "FORGET-PASSWORD");
	}
};

/*****************************************************************************
 * Resets the password for the user or admin account with the provided reset token.
 * @route POST /api/v1/reset/password/:resetToken
 * @param {string} email.required - User's email address
 * @param {string} resetToken.required - User's email address
 * @Return Returns a JSON object with a success message if the password is updated successfully.
 * @throws {CustomError} - If the reset token is invalid or has expired, or if the password and confirm password do not match
 ******************************************************************************/
exports.resetPassword = async (req, res) => {
	try {
		const { resetToken } = req.params;

		if (!resetToken) {
			throw new CustomError(403, 'Invalid Token', 'password');
		}

		const { password, confirmPassword } = req.body;

		if (!password || !confirmPassword) {
			throw new CustomError(400, 'Password and Confirm Password are required', 'password');
		}

		const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
		const user = await User.findOne({
			forgetPasswordToken: resetPasswordToken,
			forgetPasswordExpiry: { $gt: Date.now() },
		});

		if (!user) {
			throw new CustomError(403, 'The reset token you provided is invalid or has expired', 'password');
		}

		if (password !== confirmPassword) {
			throw new CustomError(400, 'Password and Confirm Password do not match', 'confirmPassword');
		}

		user.password = password;
		user.forgetPasswordToken = undefined;
		user.forgetPasswordExpiry = undefined;

		await user.save({ validateBeforeSave: false });

		res.status(200).json({
			success: true,
			message: 'Password updated',
		});
	} catch (err) {
		errorResponse(res, err, 'RESET-PASSWORD-CONTROLLER');
	}
};

/*************************************************************************
Logout controller.
@route POST /api/v1/auth/logout
@summary Logs out the user by resetting the token cookie.
@returns {Object} Returns a JSON object with a success message and null token.
@throws {Object} errorResponse - Throws an error response object with a 500 status code if an error occurs.
*****************************************************************************/
module.exports.logout = async (req, res) => {
	try {
		res.cookie("token", null, {
			expires: new Date(Date.now()),
			httpOnly: true
		})
		res.status(200).json({
			success: true,
			token: null
		})
	} catch (err) {
		errorResponse(res, err, "LOGOUT")
	}
}