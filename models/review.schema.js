const { model, Schema } = require("mongoose");

const reviewSchema = new Schema({
   comment: {
      type: String,
      required: [true, "Review are required"],
      trim: true,
   },
   rating: {
      type: String,
      require: [true, "Ratings are required"],
   },
   user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User id is Required"]
   },
   product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product id is Required"]
   }

},
   {
      timestamps: true
   }
);

const Review = model("Review", reviewSchema);

module.exports = Review;