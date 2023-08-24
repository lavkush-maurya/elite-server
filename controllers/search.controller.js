const Product = require("../models/product.schema");
const CustomError = require("../helper/customError");
const errorResponse = require("../helper/errorResponse");

/********************************************************
 * @searchController
 * @route GET /api/v1/search/:key
 * @description Searches for products in the database with a title that matches the search key passed in the request. The search is case-insensitive, and the controller returns at most 5 matching products sorted by title in ascending order.
 * @param {string} key - The search key.
 * @returns {Array} - Array of matching products.
 *********************************************************/
module.exports.searchController = async (req, res) => {
   try {
      const { key } = req.params;

      if (!key) {
         throw new CustomError(400, "Invalid search key provided.");
      }

      const result = await Product.find({
         "$or": [
            {
               title: { $regex: key, $options: "i" }
            }
         ]
      }).sort({ title: 1 }).limit(4);

      res.status(200).json(result);
   } catch (err) {
      errorResponse(req, err, "SEARCH-CONTROLLER");
   }
};
