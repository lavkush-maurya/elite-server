const CustomError = require("../helper/customError");
const Category = require("../models/category.schema");
const errorResponse = require("../helper/errorResponse");

/*************************************************************************
 * Create a new category. Only admins are authorized to create categories.
 * @createCategory
 * @Route POST /api/v1/category/create/:userId,
 * @param {Object} req - The request object.
 * @param {Object} req.user - The user object from the request.
 * @param {string} req.user.role - The role of the user.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.title - The title of the new category.
 * @param {Object} req.image - The image object from the request.
 * @param {string} req.imageId - The ID of the image.
 * @param {Object} res - The response object.
 * @returns {Object} The success message.
 * @throws {CustomError} If the user is not an admin or if the title is missing.
 ****************************************************************************/
module.exports.createCategory = async (req, res) => {
	try {
		//only ADMIN has access.
		if (req.user.role !== "ADMIN") {
			throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
		};

		const { title } = req.body;

		if (!title) {
			throw new CustomError(400, "All the fields are mandatory");
		}
		const category = await Category.create({
			name: title,
			image: req.image,
			imageId: req.imageId
		});
		console.log(category)
		return res.status(200).json({
			success: true,
			message: "New Category added"
		});

		// console.log("Body ==>",req.body);
		// console.log("Image ==>",req.image);
		// console.log("Image Id ==>",req.imageId);


		// return res.status(200).json({
		// 	success: true,
		// 	message: "New Category added"
		// });

	} catch (err) {
		console.log(err)
		errorResponse(res, err, "CREATE-CATEGORY");
	}
};
/******************************************************************************
 * Edit existing sub-category. Only Admins are authorized to edit.
 * @editCategory
 *  @Route POST api/v1/category/sub-category/edit/
 * @param {Object} req - Request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.categoryId - The ID of the category to be edited
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - The new name of the sub-category
 * @param {string} req.body.imageId - The ID of the new image for the sub-category
 * @param {Object} req.image - Request image
 * @param {Object} res - Response object
 * @returns {Object} JSON object with success message
 * @throws {CustomError} If the user is not authorized or if the category does not exist
 ******************************************************************************/
module.exports.editCategory = async (req, res) => {
	try {
		// Only Admins have access.
		if (req.user.role !== "ADMIN") {
			throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
		};

		const { categoryId } = req.params;
		const { title: name, imageId } = req.body;

		if (!name) {
			throw new CustomError(400, "All fields are mandatory");
		};

		const updateCategory = await Category.findByIdAndUpdate(
			{
				_id: categoryId
			},
			{
				name, image: req.image, imageId
			},
			{
				new: true,
				runValidators: true
			});

		if (!updateCategory) {
			throw new CustomError(400, "Category does not exist");
		}

		return res.status(200).json({
			success: true,
			message: "Category updated successfully",
		});

	} catch (err) {
		errorResponse(res, err, "EDIT-CATEGORY");
	}
};

/********************************************************
 * @deleteCategory
 * @Route DELETE /api/v1/category/remove/:categoryId
 * @description Remove an existing category. Only admin are authorized to remove a category.
 * @param {string} categoryId - The ID of the category to remove.
 * @return {Object} A JSON object with a success property indicating if the category was removed successfully, and a message property containing a success message.
 *********************************************************/
module.exports.removeCategory = async (req, res) => {
	try {
		//only ADMIN has access.
		if (req.user.role !== "ADMIN") {
			throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
		};
		const { categoryId } = req.params;
		await Category.findByIdAndRemove({ _id: categoryId });
		return res.status(200).json({
			success: true,
			message: "Category Removed Successfully",
		});
	} catch (err) {
		errorResponse(res, err, "REMOVE-CATEGORY")
	}
};

/********************************************************
 * @getAllCategories
 * @Route GET /api/v1/categories/all
 * @description Retrieve all categories and return them as a JSON response
 * @returns {Array} - An array of categories
 *********************************************************/
module.exports.getAllCategories = async (_req, res) => {
	try {
		const allCategories = await Category.find();
		return res.status(200).json({ success: true, allCategories });
	} catch (err) {
		errorResponse(res, err, "GET-ALL-CATEGORIES");
	}
};


/********************************************************
 * @getSingleCategory
 * @Route GET /api/v1/category/single/:categoryId
 * @Description Retrieve single category, and then sends the resulting data back to the client as a JSON response.
 * @Parameters categoryId
 * @Return {Object} - single category Object
 *********************************************************/
module.exports.getSingleCategory = async (req, res) => {
	try {
		const { categoryId } = req.params;
		const singleCategory = await Category.findById(
			{
				_id: categoryId
			});

		return res.status(200).json({ success: true, singleCategory });

	} catch (err) {
		errorResponse(res, err, "GET-SINGLE CATEGORY")
	}
};
