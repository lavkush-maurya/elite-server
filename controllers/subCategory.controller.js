const SubCategory = require("../models/subCategory.schema");
const CustomError = require("../helper/customError");
const errorResponse = require("../helper/errorResponse");

/********************************************************
 * @createSubCategory
 * @Route POST /api/v1/sub-category/create/:userId
 * @Description Create new sub-category. Only admin users are authorized to create sub-categories.
 * @Parameters {string} title - The name of the sub-category to be created.
 * @Parameters {string} category - The ID of the category to which the new sub-category belongs.
 * @Return success message.
 *********************************************************/
module.exports.createSubCategory = async (req, res) => {
   try {
      // Only ADMIN have access.
      if (req.user.role !== "ADMIN") {
         throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
      }

      const { title, category } = req.body;
      if (!title || !category) {
         throw new CustomError(400, "All fields are mandatory.");
      }

      await SubCategory.create({
         name: title,
         image: req.image,
         imageId: req.imageId,
         category
      });

      return res.status(200).json({
         success: true,
         message: "New sub-category added."
      });

   } catch (err) {
      errorResponse(res, err, "CREATE-SUB-CATEGORY");
   }
};


/********************************************************
@editSubCategory
@route PUT /api/v1/sub-category/edit/:userId/:subCategoryId
@description Edit an existing sub-category. Only Admins are authorized to edit sub-categories.
@param {string} subCategoryId - The ID of the sub-category to edit.
@param {string} name - The new name for the sub-category.
@param {string} imageId - The ID of the new image for the sub-category.
@param {string} category - The ID of the category to which the sub-category belongs.
@returns {object} - A success message.
*********************************************************/
module.exports.editSubCategory = async (req, res) => {
   try {
      // Only ADMIN has access.
      if (req.user.role !== "ADMIN") {
         throw new CustomError(401, "Access denied. You are not authorized to access this resource.", "");
      }

      const { subCategoryId } = req.params;
      const { title, imageId, category } = req.body;

      if (!title || !imageId || !category) {
         throw new CustomError(400, "All the fields are mandatory", "Edit validation");
      }

      const updateSubCategory = await SubCategory.findByIdAndUpdate(
         {
            _id: subCategoryId
         },
         {
            name: title, imageId, image: req.image, category
         },
         {
            new: true,
            runValidators: true
         }
      );

      if (!updateSubCategory) {
         throw new CustomError(400, "The requested sub-category does not exist.");
      }

      return res.status(200).json({
         success: true,
         message: "Sub-category updated successfully."
      });

   } catch (err) {
      errorResponse(res, err, "EDIT-SUB-CATEGORY");
   };
};


/*****************************************************************************
 * @description Remove existing sub-category. Only Admins are authorized to remove.
 * @route DELETE /api/v1/sub-category/remove/:subCategoryId:categoryId
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Object} The success message
 ******************************************************************************/
module.exports.removeSubCategory = async (req, res) => {
   try {
      if (req.user.role !== 'ADMIN') {
         throw new CustomError(
            401,
            'Access denied. You are not authorized to access this resource.'
         );
      }

      const { subCategoryId } = req.params;
      const deleteSubCategory = await SubCategory.findByIdAndRemove({
         _id: subCategoryId,
      });

      if (!deleteSubCategory) {
         throw new CustomError(400, 'Requested sub-category does not exist.');
      }

      return res.status(200).json({
         success: true,
         message: 'Sub-category removed successfully.',
      });
   } catch (err) {
      errorResponse(res, err, 'DELETE-SUB-CATEGORY');
   }
};

/***************************************************************
 * @description Retrieve single sub-category by ID.
 * @route GET /api/v1/sub-category/single/:subCategoryId
 * @returns {Object} The single sub-category object
 ****************************************************************/
module.exports.getSingleSubCategory = async (req, res) => {
   try {
      const { subCategoryId } = req.params;
      const singleSubCategory = await SubCategory.findOne({
         _id: subCategoryId,
      }).exec();

      return res.status(200).json({ success: true, singleSubCategory });
   } catch (err) {
      errorResponse(res, err, 'GET-SINGLE-SUB-CATEGORY');
   }
};

/********************************************************************************
 * @description Retrieve all sub-categories related to a category.
 * @route GET /api/v1/sub-category/:categoryId
 * @returns {Array} The sub-category array
 ******************************************************************************/
module.exports.getAllRelatedSubCategory = async (req, res) => {
   try {
      const { categoryId } = req.params;
      const subCategories = await SubCategory.find({ category: categoryId });
      return res.status(200).json({ success: true, subCategories });
   } catch (err) {
      errorResponse(res, err, 'GET-RELATED-SUB-CATEGORY');
   }
};

/*****************************************************************************
 * @description Retrieve all sub-categories.
 * @route GET /api/v1/sub-categories/all
 * @returns {Array} The sub-category array
 ***************************************************************************/
module.exports.getAllSubCategory = async (_req, res) => {
   try {
      const subCategories = await SubCategory.find().populate('category', 'name _id');
      return res.status(200).json({ success: true, subCategories });
   } catch (err) {
      // console.log(err);
      errorResponse(res, err, 'GET-ALL-SUB-CATEGORY');
   }
};


/********************************************************
@getSubCategoryByLimits
@description Retrieves all sub-categories based on page and limit parameters from a specified category ID, and sends the resulting data back to the client as a JSON response.
@route GET /api/v1/:categoryId/sub-category?page=1&limit=12
@param {string} req.params.categoryId - The ID of the category to retrieve sub-categories from
@param {number} req.query.page - The page number to retrieve
@param {number} req.query.limit - The number of sub-categories to retrieve per page
@returns {object} An object containing an array of sub-categories and pagination information
@throws {CustomError} If the page and limit parameters are not provided
*********************************************************/
module.exports.getSubCategoryByLimits = async (req, res) => {
   try {
      const { categoryId } = req.params;
      let { page, limit } = req.query;
      const startsIndexAt = (page - 1) * limit;

      const DEFAULT_PAGE = 1;
      const DEFAULT_LIMIT = 12;
      const MAX_LIMIT = 100;

      // Validate page and limit parameters
      page = parseInt(page) || DEFAULT_PAGE;
      limit = parseInt(limit) || DEFAULT_LIMIT;

      if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
         throw new CustomError(400, "Invalid page or limit parameter");
      }

      if (limit > MAX_LIMIT) {
         limit = MAX_LIMIT;
      }

      const subCategoryCount = await SubCategory.countDocuments({ category: categoryId });
      const subCategory = await SubCategory.find({ category: categoryId })
         .limit(limit)
         .skip(startsIndexAt);

      const totalPage = Math.ceil(subCategoryCount / limit);

      let prevPage = page - 1;
      let nextPage = page + 1;

      const pagination = {};

      if (prevPage > 0) {
         pagination.previous = {
            page: prevPage,
            limit
         };
      }

      if (nextPage <= totalPage) {
         pagination.next = {
            page: nextPage,
            limit
         };
      }

      return res.status(200).json({
         success: true,
         subCategory,
         pagination: {
            total: subCategoryCount,
            page,
            limit,
            totalPage,
            ...pagination
         }
      });
   } catch (err) {
      errorResponse(res, err, "PAGINATED-SUB-CATEGORY");
   }
};

