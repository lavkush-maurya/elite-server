const Review = require("../models/review.schema");
const CustomError = require("../helper/customError");
const errorResponse = require("../helper/errorResponse");

/*************************************************************************
 * Get all the reviews and ratings for a specific product based on the product id.
 * @name getSingleProductReviews
 * @route GET /reviews/product/:productId
 * @returns {Object} Returns a JSON object with the following properties:
 * - success (boolean): Whether the request was successful.
 * - reviews (Array): An array of all the reviews in the database based on the product id.
 * @throws {CustomError} If there's an error fetching the data from the database.
 *****************************************************************************/
module.exports.getSingleProductReviews = async (req, res) => {
   try {
      const { productId } = req.params;
      const reviews = await Review.find({ product: productId }).populate("user", "image name");
      res.status(200).json({ success: true, reviews });
   } catch (err) {
      errorResponse(res, err, "SINGLE-PRODUCT-REVIEW");
   }
};

/********************************************************************
 * Create a new review. Only authorized users and admins have access.
 * @name createReview
 * @route POST api/v1/review/create
 * @param {string} req.body.comment - The comment for the review.
 * @param {number} req.body.rating - The rating for the review.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The user ID of the authenticated user.
 * @returns {Object} Returns a JSON object with the following properties:
 * - success (boolean): Whether the review was successfully created.
 * - message (string): A success message indicating that the review was added.
 * @throws {CustomError} If there's an error creating the review.
 *********************************************************************/
module.exports.createReview = async (req, res) => {
   try {
      const { comment, rating, id } = req.body;
      if (!comment || !rating) {
         throw new CustomError(400, "All input fields are mandatory");
      }
      const review = await Review.create({
         comment,
         rating,
         user: req.user.id,
         product: id,
      });
      res.status(200).json({ success: true, message: "Review added", review });
   } catch (err) {
      errorResponse(res, err, "REVIEW-CREATE");
   }
};

/********************************************************************
 * Update existing review. Only authorized users and admins have access.
 * @name updateReview
 * @route POST api/v1/review/update/:reviewId
 * @param {string} req.body.comment - The comment for the review.
 * @param {number} req.body.rating - The rating for the review.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user.id - The user ID of the authenticated user.
 * @returns {Object} Returns a JSON object with the following properties:
 * - success (boolean): Whether the review was successfully created.
 * - message (string): A success message indicating that the review was added.
 * - review (Object)
 * @throws {CustomError} If there's an error creating the review.
 *********************************************************************/
module.exports.updateReview = async (req, res) => {
   try {
      const { reviewId } = req.params
      const { comment, rating, id } = req.body;
      if (!comment || !rating) {
         throw new CustomError(400, "All input fields are mandatory");
      }
      const review = await Review.findByIdAndUpdate({
         _id: reviewId
      }, {
         comment,
         rating,
         user: req.user.id,
         product: id,
      });
      res.status(200).json({ success: true, message: "Review updated", review });
   } catch (err) {
      errorResponse(res, err, "REVIEW-UPDATE");
   }
};

/******************************************************************
 * Get all the reviews and ratings for all products.
 * @name getAllReviews
 * @route GET api/v1/review/all
 * @returns {Object} Returns a JSON object with the following properties:
 * - success (boolean): Whether the request was successful.
 * - reviews (Array): An array of all the reviews in the database.
 * @throws {CustomError} If there's an error fetching the data from the database.
 ************************************************************************/
module.exports.getAllReviews = async (_req, res) => {
   try {
      const reviews = await Review.find().populate("user product", "image name title");
      res.status(200).json({ success: true, reviews });
   } catch (err) {
      errorResponse(res, err, "REVIEW-ALL");
   }
};

/****************************************************************************
Get single review and ratings for a specific product based on product ID.
@name getSingleReview
@route GET api/v1/reviews/:reviewId
@returns {Object} Returns a JSON object with the following properties:
success (boolean): Whether the request was successful.
review (Object): The review object with user, product, and rating details.
@throws {CustomError} If there's an error fetching the data from the database.
******************************************************************************/
module.exports.getSingleReview = async (req, res) => {
   try {
      const { reviewId } = req.params;
      const review = await Review.findById(reviewId).populate(
         "user product",
         "image name title"
      );
      if (!review) {
         throw new CustomError(404, "Review not found!");
      }
      res.status(200).json({ success: true, review });
   } catch (err) {
      errorResponse(res, err, "SINGLE-REVIEW");
   }
};
/****************************************************************************
Delete a single review based on review ID.
@name deleteSingleReview
@route DELETE api/v1/reviews/:reviewId
@returns {Object} Returns a JSON object with the following properties:
success (boolean): Whether the request was successful.
message (string): A message indicating that the review has been removed.
@throws {CustomError} If there's an error fetching the data from the database.
******************************************************************************/
module.exports.deleteSingleReview = async (req, res) => {
   try {
      const { reviewId } = req.params;
      const review = await Review.findByIdAndRemove({ _id: reviewId });
      if (!review) {
         throw new CustomError(404, "Review not found!");
      }
      res.status(200).json({ success: true, message: "Review removed", review });
   } catch (err) {
      errorResponse(res, err, "DELETE-REVIEW");
   }
};
