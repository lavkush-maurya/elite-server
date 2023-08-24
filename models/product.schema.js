const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Product Title should be less then 100 Characters"],
      required: [true, "Title is Required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is Required"],
    },
    price: {
      type: Number,
      trim: true,
      maxlength: [10, "Max length should be less then 10 digits"],
      required: true,
    },
    sellPrice: {
      type: Number,
      trim: true,
      maxlength: [10, "Max length should be less then 10 digits"],
      required: true,
    },
    productCost: {
      type: Number,
      trim: true,
      maxlength: [10, "Max length should be less then 10 digits"],
      required: true,
    },
    image: {
      type: String,
      required: [true, "Image URL is Required"],
    },
    imageId: {
      type: String,
      required: [true, "Image Public Id is Required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is Required"],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "Sub-category is Required"],
    },
    stock: {
      type: Number,
      default: 0,
      required: [true, "Stock quantity is Required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", productSchema);
module.exports = Product;
