const Product = require("../models/product.schema");
const CustomError = require("../helper/customError");
const errorResponse = require("../helper/errorResponse");

/********************************************************
 * @createNewProduct
 * @description Create a new product. Only admin users are authorized.
 * @route POST /api/v1/products
 * @param {string} req.body.title - Product title
 * @param {string} req.body.description - Product description
 * @param {number} req.body.price - Product price
 * @param {number} req.body.sellPrice - Product sell price
 * @param {number} req.body.productCost - Product cost
 * @param {number} req.body.stock - Product stock
 * @param {string} req.body.category - Product category ID
 * @param {string} req.body.subCategory - Product sub-category ID
 * @param {string} req.body.image - Base64-encoded image data
 * @param {string} req.body.imageId - Cloudinary image ID
 * @returns {Object} A success message
 * @throws {CustomError} If the user is not authorized or if any of the required fields is missing.
 *********************************************************/
module.exports.createNewProduct = async (req, res) => {
   try {
      //only ADMIN has access.
      if (req.user.role !== "ADMIN") {
         throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
      };
      const {
         title,
         description,
         price,
         sellPrice,
         productCost,
         stock,
         category,
         subCategory,
      } = req.body;
      if (
         !title ||
         !description ||
         !price ||
         !sellPrice ||
         !productCost ||
         !stock ||
         !category ||
         !subCategory
      ) {
         throw new CustomError(400, "All the fields are mandatory", "all");
      };

      await Product.create({
         title,
         description,
         price,
         sellPrice,
         productCost,
         stock,
         image: req.image,
         imageId: req.imageId,
         category,
         subCategory
      });

      return res.status(200).json({
         success: true,
         message: "New Product added"
      })

   } catch (err) {
      errorResponse(res, err, "CREATE-NEW-PRODUCT");
   }
}

/********************************************************
 * @editProduct
 * @Route GET /api/v1/products/edit/:userId/:productId
 * @Description Edit product controller, only admin has access to edit product.
 * @param {string} req.params.productId - The ID of the product to be edited
 * @param {string} req.body.title - The updated title of the product
 * @param {string} req.body.description - The updated description of the product
 * @param {number} req.body.price - The updated price of the product
 * @param {number} req.body.sellPrice - The updated sell price of the product
 * @param {number} req.body.productCost - The updated product cost of the product
 * @param {number} req.body.stock - The updated stock of the product
 * @param {string} req.body.category - The updated category of the product
 * @param {string} req.body.subCategory - The updated subcategory of the product
 * @param {object} req.image - The updated image file of the product
 * @param {string} req.imageId - The updated image ID of the product
 * @returns {object} The updated product and a success message
 *********************************************************/
module.exports.editProduct = async (req, res) => {
   try {
      //only ADMIN has access.
      if (req.user.role !== "ADMIN") {
         throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
      };
      const { productId } = req.params;
      const {
         title,
         description,
         price,
         sellPrice,
         productCost,
         stock,
         category,
         subCategory,
      } = req.body;

      if (
         !title ||
         !description ||
         !price ||
         !sellPrice ||
         !productCost ||
         !stock ||
         !category ||
         !subCategory
      ) {
         throw new CustomError(400, "All the fields are mandatory");
      };
      const updateProduct = await Product.findByIdAndUpdate(
         {
            _id: productId
         },
         {
            title, description, price, sellPrice, productCost, image: req.image, imageId: req.imageId, stock, category, subCategory
         },
         {
            new: true, runValidators: true
         }
      );
      if (!updateProduct) {
         throw new CustomError(400, "Update product failed, please try again")
      }

      return res.status(200).json({
         success: true,
         message: "Product updated successfully"
      })

   } catch (err) {
      console.log(err)
      errorResponse(res, err, "EDIT-PRODUCT");
   }
}

/********************************************************
 * @deleteProduct
 * @Route DELETE /api/v1/products/remove/:userId/:productId
 * @Description Delete product controller, only admin has access to delete product.
 * @param {string} productId - The ID of the product to delete.
 * @returns {object} - A success message indicating that the product has been deleted.
 *********************************************************/
module.exports.deleteProduct = async (req, res) => {
   try {
      // Only ADMIN has access.
      if (req.user.role !== "ADMIN") {
         throw new CustomError(401, "Access denied. You are not authorized to access this resource.");
      };

      const { productId } = req.params;
      const deleteProduct = await Product.findByIdAndRemove({ _id: productId });

      if (!deleteProduct) {
         throw new CustomError(400, "Product delete failed");
      }

      return res.status(200).json({
         success: true,
         message: "Product deleted successfully"
      });
   } catch (err) {
      errorResponse(res, err, "DELETE-PRODUCT");
   }
};

/******************************************************
Retrieves products based on the provided page number and limit,
and then sends the resulting data back to the client as a JSON response.
@route GET /api/v1/:subCategoryId/product?page=1&limit=12
@param {Object} req - Express request object
@param {Object} res - Express response object
@throws {CustomError} 400 - Page, Limit, and Sub Category ID are required
@returns {Object} - Products Array
******************************************************/
module.exports.getProductsByLimits = async (req, res) => {
   try {
      const { page, limit } = req.query;
      const { subCategoryId } = req.params;

      // Check if required query parameters are present
      if (!page || !limit || !subCategoryId) {
         throw new CustomError(400, "Page, Limit and Sub Category Id are required");
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Get the total count of products in the subcategory
      const totalCount = await Product.countDocuments({ subCategory: subCategoryId });

      // Retrieve products based on the query parameters
      const products = await Product.find({ subCategory: subCategoryId })
         .select("-sold -productCost")
         .limit(limit)
         .skip(startIndex)
         .exec();

      // Set pagination information
      const totalPage = Math.ceil(totalCount / limit);
      const next = (endIndex < totalCount) ? { page: parseInt(page) + 1, limit: limit } : null;
      const previous = (startIndex > 0) ? { page: parseInt(page) - 1, limit: limit } : null;

      // Send the response
      return res.status(200).json({ success: true, products, pagination: { totalPage, next, previous } });
   } catch (err) {
      errorResponse(res, err, "GET-PAGINATED-PRODUCTS");
   }
};

/********************************************************
 * @getAllProducts
 * @description Retrieve all products from the database.
 * @route GET /api/v1/products/all
 * @throws {CustomError} 500 - Server error
 * @returns {Object} Products array
 ********************************************************/
module.exports.getAllProducts = async (_req, res) => {
   try {
      const products = await Product.find().populate("subCategory category", "_id name");
      res.status(200).json({ success: true, products })

   } catch (err) {
      errorResponse(res, err, "GET-ALL-PRODUCTS")
   }
}

/********************************************************
 * Retrieves a single product based on the provided product ID and then sends the resulting data back to the client as a JSON response.
 * @getSingleProducts
 * @route GET /api/v1/product/single/:productId
 * @throws {CustomError} 400 - Product ID is required
 * @returns {object} - Product object
 *********************************************************/
module.exports.getSingleProducts = async (req, res) => {
   try {
      const { productId } = req.params;

      if (!productId) {
         throw new CustomError(400, "Product ID is required");
      }

      const products = await Product.findById(productId).populate("category subCategory", "_id name").exec();

      return res.status(200).json({ success: true, products });
   } catch (err) {
      errorResponse(res, err, "GET-SINGLE_PRODUCT");
   }
};

/********************************************************
* @getBestSellingProducts
* @Route GET /api/v1/product/best-selling
* @description Retrieves the best-selling products and sends them back to the client as a JSON response.
* @returns {Object} - Products Array with a limit of 12
*********************************************************/
module.exports.getBestSellingProducts = async (_req, res) => {
   try {
      const products = await Product.aggregate([{ $sample: { size: 12 } }])
      return res.status(200).json({ success: true, products })
   } catch (err) {
      errorResponse(res, err, "GET-BEST-SELLING-PRODUCT");
   }
};
