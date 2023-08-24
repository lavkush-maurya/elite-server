const { Schema, model } = require("mongoose");

const subCategorySchema = new Schema({
   name: {
      type: String,
      trim: true,
      required: [true, "Sub-category is Required"],
      unique: true,
   },
   image: {
      type: String,
      required: [true, "Image URL is Required"]
   },
   imageId: {
      type: String,
      required: [true, "Image URL is Required"]
   },
   category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category id is Required"]
   }
},
   {
      timestamps: true,
   }
);

const SubCategory = model("SubCategory", subCategorySchema);
module.exports = SubCategory;