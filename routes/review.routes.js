const route = require("express").Router();
const { isAuthenticated } = require("../middlewares/authMiddleware");
const {
   getSingleProductReviews,
   createReview,
   getAllReviews,
   getSingleReview,
   updateReview,
   deleteSingleReview
} = require("../controllers/review.controller");

route.get("/reviews/product/:productId", getSingleProductReviews);
route.get("/reviews/all", getAllReviews);
route.get("/review/details/:reviewId", getSingleReview);
route.post("/review/create", isAuthenticated, createReview);
route.put("/review/update/:reviewId", isAuthenticated, updateReview);
route.delete("/review/delete/:reviewId", isAuthenticated, deleteSingleReview);

module.exports = route;